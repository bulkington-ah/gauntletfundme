import Link from "next/link";
import type { ReactNode } from "react";

import type { AuthenticatedViewer } from "@/application";
import { SignOutButton } from "@/presentation/auth/sign-out-button";

import styles from "./public-site-shell.module.css";

type PublicSiteShellProps = {
  children: ReactNode;
  returnTo: string;
  viewer: AuthenticatedViewer | null;
};

export function PublicSiteShell({
  children,
  returnTo,
  viewer,
}: PublicSiteShellProps) {
  const signInHref = `/login?next=${encodeURIComponent(returnTo)}`;
  const viewerRoleLabel = viewer ? toTitleCase(viewer.role) : null;

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

          <Link className={styles.brand} href="/">
            gofundme <span className={styles.brandAccent}>v2</span>
          </Link>

          <div
            className={`${styles.navCluster} ${styles.navClusterEnd} ${styles.desktopOnly}`}
          >
            <wa-button className={styles.navButton} appearance="plain" withCaret>
              About
            </wa-button>
            <wa-button className={styles.navButton} appearance="plain">
              Alerts
            </wa-button>
            {viewer ? (
              <div className={styles.authCluster}>
                <wa-badge
                  className={styles.authBadge}
                  appearance="outlined"
                  pill
                  variant="brand"
                >
                  {viewerRoleLabel}
                </wa-badge>
                <SignOutButton className={styles.authButton} />
              </div>
            ) : (
              <Link className={styles.authLink} href={signInHref}>
                Sign in
              </Link>
            )}
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
              <Link className={styles.mobileMenuLink} href="/fundraisers/warm-meals-2026">
                Donate
              </Link>
              <Link
                className={styles.mobileMenuLink}
                href="/communities/neighbors-helping-neighbors"
              >
                Fundraise
              </Link>
              <Link className={styles.mobileMenuLink} href="/profiles/avery-johnson">
                Giving Funds
              </Link>
              {viewer ? (
                <div className={styles.mobileAuthRow}>
                  <span className={styles.mobileAuthLabel}>{viewerRoleLabel}</span>
                  <SignOutButton className={styles.mobileSignOutButton} />
                </div>
              ) : (
                <Link className={styles.mobileMenuLink} href={signInHref}>
                  Sign in
                </Link>
              )}
              <Link
                className={styles.mobileMenuLink}
                href="/fundraisers/warm-meals-2026?checkout=mock"
              >
                Start a GoFundMe
              </Link>
            </div>
          </wa-details>
        </div>
      </header>

      <div className={styles.content}>{children}</div>
    </div>
  );
}

const toTitleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);
