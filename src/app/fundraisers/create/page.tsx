import { redirect } from "next/navigation";
import type { JSX } from "react";

import { createApplicationApi } from "@/application";
import { getPublicShellViewerStateFromBrowserSession } from "@/presentation/auth";
import {
  CreateFundraiserPage,
  buildCreateFundraiserPageModel,
} from "@/presentation/fundraisers";

const fundraiserCreatePath = "/fundraisers/create";

export default async function FundraiserCreateRoutePage(): Promise<JSX.Element> {
  const applicationApi = createApplicationApi();
  const { viewer, viewerProfileSlug } =
    await getPublicShellViewerStateFromBrowserSession(applicationApi);

  if (!viewer) {
    redirect(`/login?next=${encodeURIComponent(fundraiserCreatePath)}`);
  }

  const model = await buildCreateFundraiserPageModel(
    {
      viewerOwnedCommunityListQuery: applicationApi,
    },
    viewer.userId,
  );

  return (
    <CreateFundraiserPage
      model={model}
      viewer={viewer}
      viewerProfileSlug={viewerProfileSlug}
    />
  );
}
