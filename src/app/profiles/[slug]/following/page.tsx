import type { JSX } from "react";

import { createApplicationApi } from "@/application";
import { getPublicShellViewerStateFromBrowserSession } from "@/presentation/auth";
import {
  PublicProfileRelationshipsPage,
  buildPublicProfilePageModel,
} from "@/presentation/profiles";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicProfileFollowingRoutePage({
  params,
}: RouteContext): Promise<JSX.Element> {
  const slug = (await params).slug;
  const applicationApi = createApplicationApi();
  const { viewer, viewerProfileSlug } =
    await getPublicShellViewerStateFromBrowserSession(applicationApi);
  const model = await buildPublicProfilePageModel(
    {
      publicProfileQuery: applicationApi,
    },
    slug,
    viewer?.userId ?? null,
  );

  return (
    <PublicProfileRelationshipsPage
      model={model}
      relationship="following"
      returnTo={`/profiles/${slug}/following`}
      viewer={viewer}
      viewerProfileSlug={viewerProfileSlug}
    />
  );
}
