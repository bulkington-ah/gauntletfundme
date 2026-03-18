import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { JSX } from "react";

import { createApplicationApi } from "@/application";
import {
  browserSessionCookieName,
  getPublicShellViewerStateFromBrowserSession,
} from "@/presentation/auth";
import { SupporterDigestPage } from "@/presentation/digest";

const digestPath = "/digest";

export default async function DigestRoutePage(): Promise<JSX.Element> {
  const applicationApi = createApplicationApi();
  const { viewer, viewerProfileSlug } =
    await getPublicShellViewerStateFromBrowserSession(applicationApi);

  if (!viewer) {
    redirect(`/login?next=${encodeURIComponent(digestPath)}`);
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(browserSessionCookieName)?.value ?? null;
  const digestResult = await applicationApi.getSupporterDigest({
    sessionToken,
  });

  if (digestResult.status !== "success") {
    redirect(`/login?next=${encodeURIComponent(digestPath)}`);
  }

  return (
    <SupporterDigestPage
      digest={digestResult.digest}
      viewer={viewer}
      viewerProfileSlug={viewerProfileSlug}
    />
  );
}
