import type { JSX } from "react";

import { createApplicationApi } from "@/application";
import { getPublicShellViewerStateFromBrowserSession } from "@/presentation/auth";
import {
  PublicCommunityPage,
  buildPublicCommunityPageModel,
} from "@/presentation/communities";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicCommunityRoutePage({
  params,
}: RouteContext): Promise<JSX.Element> {
  const slug = (await params).slug;
  const applicationApi = createApplicationApi();
  const { viewer, viewerProfileSlug } =
    await getPublicShellViewerStateFromBrowserSession(applicationApi);
  const model = await buildPublicCommunityPageModel(
    {
      publicCommunityQuery: applicationApi,
    },
    slug,
  );

  return (
    <PublicCommunityPage
      model={model}
      returnTo={`/communities/${slug}`}
      viewer={viewer}
      viewerProfileSlug={viewerProfileSlug}
    />
  );
}
