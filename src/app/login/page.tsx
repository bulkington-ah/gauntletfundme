import { redirect } from "next/navigation";
import type { JSX } from "react";

import { createApplicationApi } from "@/application";
import {
  LoginPage,
  getAuthenticatedViewerFromBrowserSession,
  resolveAuthenticatedLoginRedirect,
  resolveSafeInternalPath,
} from "@/presentation/auth";

type RouteContext = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

export default async function LoginRoutePage({
  searchParams,
}: RouteContext): Promise<JSX.Element> {
  const nextCandidate = (await searchParams).next;
  const nextPath = resolveSafeInternalPath(nextCandidate);
  const applicationApi = createApplicationApi();
  const viewer = await getAuthenticatedViewerFromBrowserSession(applicationApi);
  const redirectDestination = resolveAuthenticatedLoginRedirect(
    viewer,
    nextCandidate,
  );

  if (redirectDestination) {
    redirect(redirectDestination);
  }

  return <LoginPage nextPath={nextPath} />;
}
