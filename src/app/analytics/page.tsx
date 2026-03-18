import type { JSX } from "react";

import { createApplicationApi } from "@/application";
import { getPublicShellViewerStateFromBrowserSession } from "@/presentation/auth";
import { PublicAnalyticsDashboardPage } from "@/presentation/analytics";

export default async function AnalyticsPage(): Promise<JSX.Element> {
  const applicationApi = createApplicationApi();
  const { viewer, viewerProfileSlug } =
    await getPublicShellViewerStateFromBrowserSession(applicationApi);
  const dashboard = await applicationApi.getAnalyticsDashboard();

  return (
    <PublicAnalyticsDashboardPage
      dashboard={dashboard}
      viewer={viewer}
      viewerProfileSlug={viewerProfileSlug}
    />
  );
}
