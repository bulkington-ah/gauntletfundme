import type { JSX } from "react";

import { createApplicationApi } from "@/application";
import { getPublicShellViewerStateFromBrowserSession } from "@/presentation/auth";
import {
  PublicFundraiserPage,
  buildPublicFundraiserPageModel,
} from "@/presentation/fundraisers";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicFundraiserRoutePage({
  params,
}: RouteContext): Promise<JSX.Element> {
  const slug = (await params).slug;
  const applicationApi = createApplicationApi();
  const { viewer, viewerProfileSlug } =
    await getPublicShellViewerStateFromBrowserSession(applicationApi);
  const model = await buildPublicFundraiserPageModel(
    {
      publicFundraiserQuery: applicationApi,
    },
    slug,
    viewer?.userId ?? null,
  );

  return (
    <PublicFundraiserPage
      model={model}
      returnTo={`/fundraisers/${slug}`}
      viewer={viewer}
      viewerProfileSlug={viewerProfileSlug}
    />
  );
}
