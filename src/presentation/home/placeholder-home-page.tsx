import Link from "next/link";
import type { JSX } from "react";

import type { AuthenticatedViewer } from "@/application";
import { PublicSiteShell } from "@/presentation/shared";

import styles from "./placeholder-home-page.module.css";

type PlaceholderHomePageProps = {
  viewer?: AuthenticatedViewer | null;
};

export function PlaceholderHomePage({
  viewer = null,
}: PlaceholderHomePageProps): JSX.Element {
  return (
    <PublicSiteShell returnTo="/" viewer={viewer}>
      <main className={styles.hero}>
        <section className={styles.heroCard}>
          <p className={styles.eyebrow}>Public surface foundation</p>
          <h1 className={styles.heading}>GoFundMe V2</h1>
          <p className={styles.lead}>
            The shared shell is now in place. Use the prototype routes below to
            explore the fundraiser, community, and profile experiences while the
            redesign rolls out one task at a time.
          </p>

          <div className={styles.ctaRow}>
            <wa-button
              className={styles.ctaButton}
              appearance="accent"
              href="/fundraisers/warm-meals-2026"
              pill
              variant="brand"
            >
              Explore fundraiser
            </wa-button>
            <wa-button
              className={styles.ctaButton}
              appearance="outlined"
              href="/communities/neighbors-helping-neighbors"
              pill
            >
              Explore community
            </wa-button>
            <wa-button
              className={styles.ctaButton}
              appearance="outlined"
              href="/profiles/avery-johnson"
              pill
            >
              Explore profile
            </wa-button>
          </div>
        </section>

        <section className={styles.routeGrid}>
          <Link className={styles.routeCard} href="/fundraisers/warm-meals-2026">
            <p className={styles.routeEyebrow}>Fundraiser</p>
            <h2 className={styles.routeTitle}>Warm Meals 2026</h2>
            <p className={styles.routeBody}>
              Prototype campaign story, mocked donation entry, and connected
              organizer/community context.
            </p>
            <span className={styles.routeFooter}>Open route</span>
          </Link>

          <Link
            className={styles.routeCard}
            href="/communities/neighbors-helping-neighbors"
          >
            <p className={styles.routeEyebrow}>Community</p>
            <h2 className={styles.routeTitle}>Neighbors Helping Neighbors</h2>
            <p className={styles.routeBody}>
              Public discussion, organizer context, and a path to the connected
              fundraiser.
            </p>
            <span className={styles.routeFooter}>Open route</span>
          </Link>

          <Link className={styles.routeCard} href="/profiles/avery-johnson">
            <p className={styles.routeEyebrow}>Profile</p>
            <h2 className={styles.routeTitle}>Avery Johnson</h2>
            <p className={styles.routeBody}>
              Organizer profile with linked fundraisers and communities in the
              shared public shell.
            </p>
            <span className={styles.routeFooter}>Open route</span>
          </Link>
        </section>
      </main>
    </PublicSiteShell>
  );
}
