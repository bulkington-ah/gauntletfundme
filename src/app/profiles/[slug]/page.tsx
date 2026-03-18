import type { JSX } from "react";

import { createApplicationApi } from "@/application";
import { getAuthenticatedViewerFromBrowserSession } from "@/presentation/auth";
import {
  PublicProfilePage,
  buildPublicProfilePageModel,
} from "@/presentation/profiles";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicProfileRoutePage({
  params,
}: RouteContext): Promise<JSX.Element> {
  const slug = (await params).slug;
  const applicationApi = createApplicationApi();
  const viewer = await getAuthenticatedViewerFromBrowserSession(applicationApi);
  const model = await buildPublicProfilePageModel(
    {
      publicProfileQuery: applicationApi,
    },
    slug,
  );

  return (
    <PublicProfilePage
      model={model}
      returnTo={`/profiles/${slug}`}
      viewer={viewer}
    />
  );
}
