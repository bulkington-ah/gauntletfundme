import type { JSX } from "react";

import { createApplicationApi } from "@/application";
import { getPublicShellViewerStateFromBrowserSession } from "@/presentation/auth";
import {
  PublicCommunityBrowsePage,
  buildPublicCommunityBrowsePageModel,
} from "@/presentation/communities";

export default async function CommunityBrowsePage(): Promise<JSX.Element> {
  const applicationApi = createApplicationApi();
  const { viewer, viewerProfileSlug } =
    await getPublicShellViewerStateFromBrowserSession(applicationApi);
  const model = await buildPublicCommunityBrowsePageModel({
    publicCommunityQuery: applicationApi,
  });

  return (
    <PublicCommunityBrowsePage
      model={model}
      returnTo="/communities"
      viewer={viewer}
      viewerProfileSlug={viewerProfileSlug}
    />
  );
}
