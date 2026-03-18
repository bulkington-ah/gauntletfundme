import type { JSX } from "react";

import { createApplicationApi } from "@/application";
import { getAuthenticatedViewerFromBrowserSession } from "@/presentation/auth";
import {
  PublicCommunityBrowsePage,
  buildPublicCommunityBrowsePageModel,
} from "@/presentation/communities";

export default async function CommunityBrowsePage(): Promise<JSX.Element> {
  const applicationApi = createApplicationApi();
  const viewer = await getAuthenticatedViewerFromBrowserSession(applicationApi);
  const model = await buildPublicCommunityBrowsePageModel({
    publicCommunityQuery: applicationApi,
  });

  return (
    <PublicCommunityBrowsePage
      model={model}
      returnTo="/communities"
      viewer={viewer}
    />
  );
}
