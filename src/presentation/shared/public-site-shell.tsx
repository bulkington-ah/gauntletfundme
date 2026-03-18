import Link from "next/link";
import type { ReactNode } from "react";

import type { AuthenticatedViewer } from "@/application";
import { SignOutButton } from "@/presentation/auth/sign-out-button";

import styles from "./public-site-shell.module.css";

type PublicSiteShellProps = {
  children: ReactNode;
  returnTo: string;
  viewer: AuthenticatedViewer | null;
  viewerProfileSlug?: string | null;
};

export function PublicSiteShell({
  children,
  returnTo,
  viewer,
  viewerProfileSlug = null,
}: PublicSiteShellProps) {
  const signInHref = `/login?next=${encodeURIComponent(returnTo)}`;
  const navigationItems = [
    ...(viewer && viewerProfileSlug
      ? [{ href: `/profiles/${viewerProfileSlug}`, label: "Profile" }]
      : []),
    ...(viewer ? [{ href: "/digest", label: "Digest" }] : []),
    { href: "/communities", label: "Communities" },
    { href: "/fundraisers", label: "Fundraisers" },
  ];

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={`${styles.navCluster} ${styles.desktopOnly}`}>
            {navigationItems.map((item) => (
              <Link className={styles.navLink} href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </div>

          <Link className={styles.brand} href="/">
            gauntletfundme
          </Link>

          <div
            className={`${styles.navCluster} ${styles.navClusterEnd} ${styles.desktopOnly}`}
          >
            {viewer ? (
              <div className={styles.authCluster}>
                <SignOutButton className={styles.authButton} />
              </div>
            ) : (
              <Link className={styles.authLink} href={signInHref}>
                Sign in
              </Link>
            )}
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
            summary="Navigate"
          >
            <div className={styles.mobileMenuLinks}>
              {navigationItems.map((item) => (
                <Link className={styles.mobileMenuLink} href={item.href} key={item.href}>
                  {item.label}
                </Link>
              ))}
              {viewer ? (
                <SignOutButton className={styles.mobileSignOutButton} />
              ) : (
                <Link className={styles.mobileMenuLink} href={signInHref}>
                  Sign in
                </Link>
              )}
            </div>
          </wa-details>
        </div>
      </header>

      <div className={styles.content}>{children}</div>
    </div>
  );
}
