import Link from "next/link";
import type { JSX } from "react";

import type { AuthenticatedViewer } from "@/application";
import { PublicSiteShell } from "@/presentation/shared";

import styles from "./placeholder-home-page.module.css";

type PlaceholderHomePageProps = {
  viewer?: AuthenticatedViewer | null;
  viewerProfileSlug?: string | null;
};

export function PlaceholderHomePage({
  viewer = null,
  viewerProfileSlug = null,
}: PlaceholderHomePageProps): JSX.Element {
  return (
    <PublicSiteShell
      returnTo="/"
      viewer={viewer}
      viewerProfileSlug={viewerProfileSlug}
    >
      <main className={styles.hero}>
        <section className={styles.heroCard}>
          <p className={styles.eyebrow}>Public surface foundation</p>
          <h1 className={styles.heading}>GoFundMe V2</h1>
          <p className={styles.lead}>
            The shared shell is now in place. Use the browse routes below to
            explore connected fundraiser and community discovery, then jump into
            the seeded public pages for the current prototype details.
          </p>

          <div className={styles.ctaRow}>
            <wa-button
              className={styles.ctaButton}
              appearance="accent"
              href="/fundraisers"
              pill
              variant="brand"
            >
              Browse fundraisers
            </wa-button>
            <wa-button
              className={styles.ctaButton}
              appearance="outlined"
              href="/communities"
              pill
            >
              Browse communities
            </wa-button>
            <wa-button
              className={styles.ctaButton}
              appearance="outlined"
              href="/profiles/avery-johnson"
              pill
            >
              View featured profile
            </wa-button>
          </div>
        </section>

        <section className={styles.routeGrid}>
          <Link className={styles.routeCard} href="/fundraisers">
            <p className={styles.routeEyebrow}>Browse</p>
            <h2 className={styles.routeTitle}>Fundraisers</h2>
            <p className={styles.routeBody}>
              Review all current public campaigns in one place, compare momentum,
              and click through to the fundraiser that matters most.
            </p>
            <span className={styles.routeFooter}>Open route</span>
          </Link>

          <Link className={styles.routeCard} href="/communities">
            <p className={styles.routeEyebrow}>Browse</p>
            <h2 className={styles.routeTitle}>Communities</h2>
            <p className={styles.routeBody}>
              See the seeded public communities, follower momentum, and connected
              causes before opening an individual space.
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
