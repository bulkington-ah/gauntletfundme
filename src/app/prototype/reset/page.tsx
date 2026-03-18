import type { JSX } from "react";

import { createApplicationApi } from "@/application";
import {
  getPublicShellViewerStateFromBrowserSession,
} from "@/presentation/auth";
import { PrototypeResetPage } from "@/presentation/prototype";

export default async function PrototypeResetRoutePage(): Promise<JSX.Element> {
  const applicationApi = createApplicationApi();
  const { viewer, viewerProfileSlug } =
    await getPublicShellViewerStateFromBrowserSession(applicationApi);

  return (
    <PrototypeResetPage
      viewer={viewer}
      viewerProfileSlug={viewerProfileSlug}
    />
  );
}
