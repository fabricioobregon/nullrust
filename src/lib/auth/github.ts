function getClientCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET are not set");
  }
  return { clientId, clientSecret };
}

export function getGithubAuthorizeUrl(state: string, redirectUri: string): string {
  const { clientId } = getClientCredentials();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    // Just enough to read the profile and open PRs against repos the user
    // can already push to — not the broader "repo" scope, which would also
    // grant access to private repos the user can merely read.
    scope: "public_repo read:user",
    state,
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
  const { clientId, clientSecret } = getClientCredentials();
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri }),
  });
  if (!res.ok) throw new Error(`GitHub token exchange failed: ${res.status}`);

  const data = await res.json();
  if (!data.access_token) throw new Error(`GitHub token exchange returned no access_token: ${JSON.stringify(data)}`);
  return data.access_token as string;
}

export type GithubProfile = { id: string; login: string; avatarUrl: string | null };

export async function fetchGithubProfile(accessToken: string): Promise<GithubProfile> {
  const res = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`GitHub profile fetch failed: ${res.status}`);

  const data = await res.json();
  return { id: String(data.id), login: data.login, avatarUrl: data.avatar_url ?? null };
}
