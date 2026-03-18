import type { AuthenticatedViewer } from "@/application";

export const resolveSafeInternalPath = (
  candidate: string | string[] | undefined,
  fallback = "/",
): string => {
  const rawPath = Array.isArray(candidate) ? candidate[0] : candidate;

  if (!rawPath || !rawPath.startsWith("/") || rawPath.startsWith("//")) {
    return fallback;
  }

  try {
    const normalizedUrl = new URL(rawPath, "http://local.test");
    return `${normalizedUrl.pathname}${normalizedUrl.search}${normalizedUrl.hash}`;
  } catch {
    return fallback;
  }
};

export const resolveAuthenticatedLoginRedirect = (
  viewer: AuthenticatedViewer | null,
  candidate: string | string[] | undefined,
): string | null => (viewer ? resolveSafeInternalPath(candidate) : null);
