import { redirect } from "next/navigation";
import type { JSX } from "react";

import { createApplicationApi } from "@/application";
import { getPublicShellViewerStateFromBrowserSession } from "@/presentation/auth";
import { CreateCommunityPage } from "@/presentation/communities";

const communityCreatePath = "/communities/create";

export default async function CommunityCreateRoutePage(): Promise<JSX.Element> {
  const applicationApi = createApplicationApi();
  const { viewer, viewerProfileSlug } =
    await getPublicShellViewerStateFromBrowserSession(applicationApi);

  if (!viewer) {
    redirect(`/login?next=${encodeURIComponent(communityCreatePath)}`);
  }

  return (
    <CreateCommunityPage
      viewer={viewer}
      viewerProfileSlug={viewerProfileSlug}
    />
  );
}
