import Link from "next/link";
import type { JSX } from "react";

import { PublicSiteShell } from "@/presentation/shared";

import { LoginForm } from "./login-form";
import styles from "./login-page.module.css";

type LoginPageProps = {
  nextPath: string;
};

export function LoginPage({
  nextPath,
}: LoginPageProps): JSX.Element {
  return (
    <PublicSiteShell returnTo={nextPath} viewer={null}>
      <main className={styles.page}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>Account access</p>
          <h1 className={styles.heading}>Sign in to GoFundMe V2</h1>
          <p className={styles.lead}>
            Use your seeded prototype account to access protected actions like
            following, posting, commenting, moderation, and mocked donation
            flows.
          </p>

          <LoginForm nextPath={nextPath} />

          <div className={styles.footer}>
            <p className={styles.footerText}>
              You&apos;ll return to{" "}
              <span className={styles.nextPathLabel}>{nextPath}</span> after you
              sign in.
            </p>
            <Link className={styles.backLink} href={nextPath}>
              Continue browsing instead
            </Link>
          </div>
        </section>
      </main>
    </PublicSiteShell>
  );
}
