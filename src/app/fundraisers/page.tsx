import type { JSX } from "react";

import { createApplicationApi } from "@/application";
import { getPublicShellViewerStateFromBrowserSession } from "@/presentation/auth";
import {
  PublicFundraiserBrowsePage,
  buildPublicFundraiserBrowsePageModel,
} from "@/presentation/fundraisers";

export default async function FundraiserBrowsePage(): Promise<JSX.Element> {
  const applicationApi = createApplicationApi();
  const { viewer, viewerProfileSlug } =
    await getPublicShellViewerStateFromBrowserSession(applicationApi);
  const model = await buildPublicFundraiserBrowsePageModel({
    publicFundraiserQuery: applicationApi,
  });

  return (
    <PublicFundraiserBrowsePage
      model={model}
      returnTo="/fundraisers"
      viewer={viewer}
      viewerProfileSlug={viewerProfileSlug}
    />
  );
}
