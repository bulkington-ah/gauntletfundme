import type { JSX } from "react";

import { createApplicationApi } from "@/application";
import { PlaceholderHomePage } from "@/presentation/home";
import { getAuthenticatedViewerFromBrowserSession } from "@/presentation/auth";

export default async function HomePage(): Promise<JSX.Element> {
  const applicationApi = createApplicationApi();
  const viewer = await getAuthenticatedViewerFromBrowserSession(applicationApi);

  return <PlaceholderHomePage viewer={viewer} />;
}
