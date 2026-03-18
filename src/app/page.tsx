import type { JSX } from "react";

import { createApplicationApi } from "@/application";
import { PlaceholderHomePage } from "@/presentation/home";
import { getPublicShellViewerStateFromBrowserSession } from "@/presentation/auth";

export default async function HomePage(): Promise<JSX.Element> {
  const applicationApi = createApplicationApi();
  const { viewer, viewerProfileSlug } =
    await getPublicShellViewerStateFromBrowserSession(applicationApi);

  return <PlaceholderHomePage viewer={viewer} viewerProfileSlug={viewerProfileSlug} />;
}
