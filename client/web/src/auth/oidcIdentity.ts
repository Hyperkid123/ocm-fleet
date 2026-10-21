interface OidcProfile {
  sub: string;
  preferred_username?: unknown;
  email?: unknown;
  name?: unknown;
}

function claimText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function oidcIdentity(profile: OidcProfile) {
  const username =
    claimText(profile.preferred_username) ??
    claimText(profile.email) ??
    claimText(profile.name) ??
    profile.sub;
  const displayName = claimText(profile.preferred_username)
    ? username.charAt(0).toUpperCase() + username.slice(1)
    : (claimText(profile.name) ?? username);

  return {
    id: profile.sub,
    username,
    display_name: displayName,
    navLayout: [],
  };
}
