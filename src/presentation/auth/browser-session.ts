import { sessionTokenHeader } from "@/presentation/api/auth/session-header";

export const browserSessionCookieName = "gofundme_v2_session";
export const browserSessionMaxAgeSeconds = 60 * 60 * 24 * 30;

export const createSessionCookieHeader = (sessionToken: string): string => {
  const segments = [
    `${browserSessionCookieName}=${encodeURIComponent(sessionToken)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${browserSessionMaxAgeSeconds}`,
  ];

  if (process.env.NODE_ENV === "production") {
    segments.push("Secure");
  }

  return segments.join("; ");
};

export const clearSessionCookieHeader = (): string => {
  const segments = [
    `${browserSessionCookieName}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ];

  if (process.env.NODE_ENV === "production") {
    segments.push("Secure");
  }

  return segments.join("; ");
};

export const readSessionTokenFromRequest = (
  request: Pick<Request, "headers">,
): string | null => {
  const cookieHeader = request.headers.get("cookie");
  const cookieToken = readSessionTokenFromCookieHeader(cookieHeader);

  return cookieToken ?? request.headers.get(sessionTokenHeader);
};

export const readSessionTokenFromCookieHeader = (
  cookieHeader: string | null,
): string | null => {
  if (!cookieHeader) {
    return null;
  }

  const cookie = cookieHeader
    .split(";")
    .map((segment) => segment.trim())
    .find((segment) => segment.startsWith(`${browserSessionCookieName}=`));

  if (!cookie) {
    return null;
  }

  const value = cookie.slice(`${browserSessionCookieName}=`.length);
  if (!value) {
    return null;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};
