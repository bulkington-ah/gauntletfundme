import type { JSX } from "react";

import type { AuthenticatedViewer } from "@/application";
import { PublicSiteShell } from "@/presentation/shared";

import { PrototypeResetControl } from "./prototype-reset-control";
import styles from "./prototype-reset-page.module.css";

type PrototypeResetPageProps = {
  viewer?: AuthenticatedViewer | null;
  viewerProfileSlug?: string | null;
};

export function PrototypeResetPage({
  viewer = null,
  viewerProfileSlug = null,
}: PrototypeResetPageProps): JSX.Element {
  return (
    <PublicSiteShell
      returnTo="/prototype/reset"
      viewer={viewer}
      viewerProfileSlug={viewerProfileSlug}
    >
      <main className={styles.page}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>Prototype tools</p>
          <h1 className={styles.heading}>Reset prototype data</h1>
          <p className={styles.lead}>
            This hidden page restores the full demo catalog for local testing.
          </p>
          <p className={styles.warning}>
            <strong>Warning:</strong> this hard reset clears all current users,
            sessions, follows, donations, posts, comments, reports, fundraisers,
            and communities before recreating the base prototype dataset.
          </p>

          <div className={styles.control}>
            <PrototypeResetControl />
          </div>
        </section>
      </main>
    </PublicSiteShell>
  );
}
