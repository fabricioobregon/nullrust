const GITHUB_API = "https://api.github.com";

async function ghFetch(path: string, accessToken: string, init?: RequestInit) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GitHub API ${init?.method ?? "GET"} ${path} failed: ${res.status} ${body}`);
  }
  return res;
}

/** Pushes `content` to AGENTS.md on a fresh branch of `repoFullName`
 * ("owner/repo") and opens a PR against the repo's default branch. Returns
 * the PR's URL. Assumes `accessToken` already has push access to the repo
 * (the OAuth scope requested is public_repo — see src/lib/auth/github.ts). */
export async function pushAgentsMdToGithub(opts: {
  accessToken: string;
  repoFullName: string;
  content: string;
}): Promise<{ prUrl: string }> {
  const { accessToken, repoFullName, content } = opts;

  const repoRes = await ghFetch(`/repos/${repoFullName}`, accessToken);
  const { default_branch: defaultBranch } = await repoRes.json();

  const refRes = await ghFetch(`/repos/${repoFullName}/git/ref/heads/${defaultBranch}`, accessToken);
  const { object: { sha: baseSha } } = await refRes.json();

  const branch = `agents-md-builder/${Date.now()}`;
  await ghFetch(`/repos/${repoFullName}/git/refs`, accessToken, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }),
  });

  // AGENTS.md may already exist on this branch (freshly branched from
  // default, so this is really "does it exist on the default branch") — the
  // Contents API needs its current sha to update rather than create.
  let existingSha: string | undefined;
  const existingRes = await fetch(`${GITHUB_API}/repos/${repoFullName}/contents/AGENTS.md?ref=${branch}`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" },
  });
  if (existingRes.ok) {
    const existing = await existingRes.json();
    existingSha = existing.sha;
  } else if (existingRes.status !== 404) {
    throw new Error(`GitHub API GET contents/AGENTS.md failed: ${existingRes.status}`);
  }

  await ghFetch(`/repos/${repoFullName}/contents/AGENTS.md`, accessToken, {
    method: "PUT",
    body: JSON.stringify({
      message: "Update AGENTS.md via AGENTS.md Builder",
      content: Buffer.from(content, "utf8").toString("base64"),
      branch,
      ...(existingSha ? { sha: existingSha } : {}),
    }),
  });

  const prRes = await ghFetch(`/repos/${repoFullName}/pulls`, accessToken, {
    method: "POST",
    body: JSON.stringify({
      title: "Update AGENTS.md",
      head: branch,
      base: defaultBranch,
      body: "Opened automatically by [AGENTS.md Builder](https://web-production-3d281.up.railway.app).",
    }),
  });
  const pr = await prRes.json();
  return { prUrl: pr.html_url };
}
