import type { AuthenticatedViewer } from "@/application";
import { PublicSiteShell } from "@/presentation/shared";

import { CreateCommunityForm } from "./create-community-form";
import styles from "./create-community-page.module.css";

type CreateCommunityPageProps = {
  viewer: AuthenticatedViewer;
  viewerProfileSlug?: string | null;
};

export function CreateCommunityPage({
  viewer,
  viewerProfileSlug = null,
}: CreateCommunityPageProps) {
  return (
    <PublicSiteShell
      returnTo="/communities/create"
      viewer={viewer}
      viewerProfileSlug={viewerProfileSlug}
    >
      <main className={styles.page}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>Create community</p>
          <h1 className={styles.heading}>Start a public community space</h1>
          <p className={styles.lead}>
            Launch a shared home for updates, fundraising links, and supporter
            discussion. You&apos;ll be assigned as the owner automatically.
          </p>

          <CreateCommunityForm nextPath="/communities/create" />
        </section>
      </main>
    </PublicSiteShell>
  );
}
