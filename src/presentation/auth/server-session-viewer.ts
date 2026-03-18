import { cookies } from "next/headers";

import type { ApplicationApi, AuthenticatedViewer } from "@/application";

import { browserSessionCookieName } from "./browser-session";

type SessionQuery = Pick<ApplicationApi, "getSession">;
type PublicProfileSlugQuery = Pick<ApplicationApi, "getPublicProfileSlugByUserId">;

export type PublicShellViewerState = {
  viewer: AuthenticatedViewer | null;
  viewerProfileSlug: string | null;
};

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

export const getPublicShellViewerStateFromBrowserSession = async (
  sessionQuery: SessionQuery & PublicProfileSlugQuery,
): Promise<PublicShellViewerState> => {
  const viewer = await getAuthenticatedViewerFromBrowserSession(sessionQuery);

  if (!viewer) {
    return {
      viewer: null,
      viewerProfileSlug: null,
    };
  }

  return {
    viewer,
    viewerProfileSlug: await sessionQuery.getPublicProfileSlugByUserId(
      viewer.userId,
    ),
  };
};
