/**
 * Permanent unit tests for the pure, DB-free logic added this session —
 * run on every build (see package.json's `prebuild`), not thrown away like
 * the scratchpad scripts used to verify each change as it was made.
 *
 * Deliberately excludes anything that needs a live, seeded database
 * (e.g. generateAgentsMd, which reads the Aspect table via the registry) —
 * CI has no database, and adding one just for tests is a bigger change than
 * this file is trying to make. Covers only what can run anywhere:
 *
 * 1. crypto.ts's encrypt/decrypt round-trip and tamper detection — the
 *    GitHub token's only protection at rest.
 * 2. session.ts's signed-cookie sign/verify, including tamper and
 *    expiry rejection — the only thing standing between an anonymous
 *    visitor and someone else's projects.
 * 3. github-push.ts's branch-creation and create-vs-update file logic,
 *    against a mocked fetch — the actual GitHub API calls are the one
 *    part of the PR-push feature that's never been exercised for real.
 * 4. app-password.ts's signed site-wide-gate cookie (same failure modes as
 *    session.ts, independently re-checked since it's a separate
 *    implementation) and the password comparison's fail-closed behavior —
 *    this is now the only thing standing between an anonymous visitor and
 *    the whole app, not just one feature.
 */
import { encrypt, decrypt } from "@/lib/auth/crypto";
import { createSessionCookieValue, verifySessionCookieValue } from "@/lib/auth/session";
import { pushAgentsMdToGithub } from "@/lib/github-push";
import { createAppSessionCookieValue, isValidAppSessionCookie, checkPassword } from "@/lib/auth/app-password";

process.env.TOKEN_ENCRYPTION_KEY ??= Buffer.alloc(32, 7).toString("base64");
process.env.SESSION_SECRET ??= "test-secret-not-for-prod";

let failures = 0;
function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`✗ ${msg}`);
    failures++;
  }
}

function testCrypto() {
  const secret = "gho_abc123faketoken";
  const ciphertext = encrypt(secret);
  assert(ciphertext !== secret, "crypto: ciphertext should not equal plaintext");
  assert(decrypt(ciphertext) === secret, "crypto: decrypt should recover the original token");

  const tampered = ciphertext.slice(0, -4) + "AAAA";
  let threw = false;
  try {
    decrypt(tampered);
  } catch {
    threw = true;
  }
  assert(threw, "crypto: tampered ciphertext should fail to decrypt");
}

function testSession() {
  const cookie = createSessionCookieValue("user123");
  assert(cookie.split(".").length === 2, "session: cookie should be payload.signature");
  assert(verifySessionCookieValue(cookie) === "user123", "session: a freshly-signed cookie should verify to its userId");

  const [payload, signature] = cookie.split(".");
  assert(verifySessionCookieValue(`${payload}.${signature.slice(0, -2)}AA`) === null, "session: a tampered signature should fail verification");
  assert(verifySessionCookieValue(`${Buffer.from('{"userId":"other","exp":9999999999999}').toString("base64url")}.${signature}`) === null, "session: a tampered payload (signature now mismatched) should fail verification");

  const expiredCookie = createSessionCookieValue("user123", Date.now() - 1000);
  assert(verifySessionCookieValue(expiredCookie) === null, "session: a validly-signed but expired cookie should fail verification");
}

type Call = { url: string; init?: RequestInit };
type Rule = { test: (url: string, method: string) => boolean; status?: number; body?: unknown };

async function withMockedFetch(rules: Rule[], run: (calls: Call[]) => Promise<void>) {
  const calls: Call[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? "GET";
    calls.push({ url, init });
    const rule = rules.find((r) => r.test(url, method));
    if (!rule) throw new Error(`Unexpected fetch: ${method} ${url}`);
    return new Response(rule.body ? JSON.stringify(rule.body) : "", { status: rule.status ?? 200 });
  }) as typeof fetch;
  try {
    await run(calls);
  } finally {
    globalThis.fetch = original;
  }
}

async function testGithubPushCreatesNewFile() {
  await withMockedFetch(
    [
      { test: (u, m) => m === "GET" && /\/repos\/acme\/widgets$/.test(u), body: { default_branch: "main" } },
      { test: (u, m) => m === "GET" && u.includes("git/ref/heads/main"), body: { object: { sha: "base-sha-123" } } },
      { test: (u, m) => m === "POST" && u.includes("git/refs"), body: { ref: "refs/heads/agents-md-builder/123" } },
      { test: (u, m) => m === "GET" && u.includes("contents/AGENTS.md"), status: 404 },
      { test: (u, m) => m === "PUT" && u.includes("contents/AGENTS.md"), body: { content: { sha: "new-sha" } } },
      { test: (u, m) => m === "POST" && u.includes("/pulls"), body: { html_url: "https://github.com/acme/widgets/pull/42" } },
    ],
    async (calls) => {
      const { prUrl } = await pushAgentsMdToGithub({
        accessToken: "fake-token",
        repoFullName: "acme/widgets",
        content: "# AGENTS.md — widgets",
      });
      assert(prUrl === "https://github.com/acme/widgets/pull/42", `github-push: expected PR url, got ${prUrl}`);

      const branchCreate = calls.find((c) => c.url.includes("git/refs") && c.init?.method === "POST");
      const branchBody = JSON.parse(String(branchCreate?.init?.body));
      assert(branchBody.sha === "base-sha-123", "github-push: new branch should be created from the default branch's sha");

      const put = calls.find((c) => c.url.includes("contents/AGENTS.md") && c.init?.method === "PUT");
      const putBody = JSON.parse(String(put?.init?.body));
      assert(putBody.sha === undefined, "github-push: a 404'd existing-file check should not send a sha");
      assert(
        Buffer.from(putBody.content, "base64").toString("utf8") === "# AGENTS.md — widgets",
        "github-push: PUT body content should be the base64 of the generated markdown"
      );

      const pr = calls.find((c) => c.url.includes("/pulls") && c.init?.method === "POST");
      const prBody = JSON.parse(String(pr?.init?.body));
      assert(prBody.base === "main", "github-push: PR base should be the default branch");
      assert(prBody.head.startsWith("agents-md-builder/"), "github-push: PR head should be the new branch");
    }
  );
}

async function testGithubPushUpdatesExistingFileWithSha() {
  await withMockedFetch(
    [
      { test: (u, m) => m === "GET" && /\/repos\/acme\/widgets$/.test(u), body: { default_branch: "main" } },
      { test: (u, m) => m === "GET" && u.includes("git/ref/heads/main"), body: { object: { sha: "base-sha-456" } } },
      { test: (u, m) => m === "POST" && u.includes("git/refs"), body: { ref: "refs/heads/agents-md-builder/456" } },
      { test: (u, m) => m === "GET" && u.includes("contents/AGENTS.md"), body: { sha: "existing-file-sha-789" } },
      { test: (u, m) => m === "PUT" && u.includes("contents/AGENTS.md"), body: { content: { sha: "updated-sha" } } },
      { test: (u, m) => m === "POST" && u.includes("/pulls"), body: { html_url: "https://github.com/acme/widgets/pull/43" } },
    ],
    async (calls) => {
      await pushAgentsMdToGithub({
        accessToken: "fake-token",
        repoFullName: "acme/widgets",
        content: "# AGENTS.md — updated",
      });
      const put = calls.find((c) => c.url.includes("contents/AGENTS.md") && c.init?.method === "PUT");
      const putBody = JSON.parse(String(put?.init?.body));
      assert(putBody.sha === "existing-file-sha-789", "github-push: updating an existing file must send its current sha");
    }
  );
}

function testAppPassword() {
  const cookie = createAppSessionCookieValue();
  assert(cookie.split(".").length === 2, "app-password: cookie should be payload.signature");
  assert(isValidAppSessionCookie(cookie), "app-password: a freshly-signed cookie should verify");
  assert(!isValidAppSessionCookie(undefined), "app-password: a missing cookie should fail verification");

  const [payload, signature] = cookie.split(".");
  assert(!isValidAppSessionCookie(`${payload}.${signature.slice(0, -2)}AA`), "app-password: a tampered signature should fail verification");

  const expiredCookie = createAppSessionCookieValue(Date.now() - 1000);
  assert(!isValidAppSessionCookie(expiredCookie), "app-password: a validly-signed but expired cookie should fail verification");

  const original = process.env.APP_PASSWORD;
  try {
    process.env.APP_PASSWORD = "correct-password";
    assert(checkPassword("correct-password"), "app-password: the right password should pass");
    assert(!checkPassword("wrong-password"), "app-password: a wrong password should fail");
    assert(!checkPassword("correct-password-but-longer"), "app-password: a longer wrong candidate should fail, not throw");

    delete process.env.APP_PASSWORD;
    assert(!checkPassword("anything"), "app-password: with APP_PASSWORD unset, every check should fail closed, not throw");
  } finally {
    if (original === undefined) delete process.env.APP_PASSWORD;
    else process.env.APP_PASSWORD = original;
  }
}

async function main() {
  testCrypto();
  testSession();
  testAppPassword();
  await testGithubPushCreatesNewFile();
  await testGithubPushUpdatesExistingFileWithSha();

  if (failures > 0) {
    console.error(`test-unit: FAILED (${failures} failure(s))`);
    process.exit(1);
  }
  console.log("test-unit: OK — crypto, session, app-password, and github-push all passed.");
}

main();
