import type { JSX } from "react";

import { createApplicationApi } from "@/application";
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
  const model = await buildPublicFundraiserPageModel(
    {
      publicFundraiserQuery: applicationApi,
    },
    slug,
  );

  return <PublicFundraiserPage model={model} />;
}
