import type { ReactNode } from "react";

import styles from "./public-site-shell.module.css";

type PublicSiteShellProps = {
  children: ReactNode;
};

export function PublicSiteShell({
  children,
}: PublicSiteShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={`${styles.navCluster} ${styles.desktopOnly}`}>
            <wa-button className={styles.navButton} appearance="plain" href="/">
              Search
            </wa-button>
            <wa-button
              className={styles.navButton}
              appearance="plain"
              href="/fundraisers/warm-meals-2026"
              withCaret
            >
              Donate
            </wa-button>
            <wa-button
              className={styles.navButton}
              appearance="plain"
              href="/communities/neighbors-helping-neighbors"
              withCaret
            >
              Fundraise
            </wa-button>
            <wa-button
              className={styles.navButton}
              appearance="plain"
              href="/profiles/avery-johnson"
            >
              Giving Funds
            </wa-button>
            <wa-badge className={styles.newBadge} appearance="filled" pill variant="brand">
              NEW
            </wa-badge>
          </div>

          <a className={styles.brand} href="/">
            gofundme <span className={styles.brandAccent}>v2</span>
          </a>

          <div
            className={`${styles.navCluster} ${styles.navClusterEnd} ${styles.desktopOnly}`}
          >
            <wa-button className={styles.navButton} appearance="plain" withCaret>
              About
            </wa-button>
            <wa-button className={styles.navButton} appearance="plain">
              Alerts
            </wa-button>
            <wa-button className={styles.navButton} appearance="plain">
              Sign in
            </wa-button>
            <wa-button
              className={styles.ctaButton}
              appearance="outlined"
              href="/fundraisers/warm-meals-2026?checkout=mock"
              pill
            >
              Start a GoFundMe
            </wa-button>
          </div>

          <div className={`${styles.navCluster} ${styles.mobileOnly}`}>
            <wa-button className={styles.navButton} appearance="plain">
              Menu
            </wa-button>
          </div>
        </div>

        <div className={styles.mobileNav}>
          <wa-details
            className={styles.mobileDetails}
            appearance="outlined"
            iconPlacement="end"
            summary="Explore"
          >
            <div className={styles.mobileMenuLinks}>
              <a className={styles.mobileMenuLink} href="/fundraisers/warm-meals-2026">
                Donate
              </a>
              <a
                className={styles.mobileMenuLink}
                href="/communities/neighbors-helping-neighbors"
              >
                Fundraise
              </a>
              <a className={styles.mobileMenuLink} href="/profiles/avery-johnson">
                Giving Funds
              </a>
              <a className={styles.mobileMenuLink} href="/fundraisers/warm-meals-2026?checkout=mock">
                Start a GoFundMe
              </a>
            </div>
          </wa-details>
        </div>
      </header>

      <div className={styles.content}>{children}</div>
    </div>
  );
}
