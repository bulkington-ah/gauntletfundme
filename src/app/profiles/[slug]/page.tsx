import type { JSX } from "react";

import { createApplicationApi } from "@/application";
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
  const model = await buildPublicProfilePageModel(
    {
      publicProfileQuery: applicationApi,
    },
    slug,
  );

  return <PublicProfilePage model={model} />;
}
