import type {
  AuthenticatedViewer,
  SupporterDigestResponse,
} from "@/application";
import { PublicSiteShell } from "@/presentation/shared";

import { SupporterDigestPageClient } from "./supporter-digest-page-client";

type SupporterDigestPageProps = {
  digest: SupporterDigestResponse;
  viewer: AuthenticatedViewer;
  viewerProfileSlug?: string | null;
};

export function SupporterDigestPage({
  digest,
  viewer,
  viewerProfileSlug = null,
}: SupporterDigestPageProps) {
  return (
    <PublicSiteShell
      returnTo="/digest"
      viewer={viewer}
      viewerProfileSlug={viewerProfileSlug}
    >
      <SupporterDigestPageClient digest={digest} />
    </PublicSiteShell>
  );
}
