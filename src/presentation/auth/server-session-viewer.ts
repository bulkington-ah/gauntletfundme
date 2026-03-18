import { cookies } from "next/headers";

import type { ApplicationApi, AuthenticatedViewer } from "@/application";

import { browserSessionCookieName } from "./browser-session";

type SessionQuery = Pick<ApplicationApi, "getSession">;

export const getAuthenticatedViewerFromBrowserSession = async (
  sessionQuery: SessionQuery,
): Promise<AuthenticatedViewer | null> => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(browserSessionCookieName)?.value ?? null;

  if (!sessionToken) {
    return null;
  }

  const result = await sessionQuery.getSession({ sessionToken });
  return result.status === "success" ? result.viewer : null;
};
