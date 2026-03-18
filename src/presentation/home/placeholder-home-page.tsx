import Image from "next/image";
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
      <main className={styles.page}>
        <section className={styles.imageWrap}>
          <Image
            alt="Volunteers and children planting a young tree together outdoors"
            className={styles.heroImage}
            height={1024}
            priority
            sizes="(max-width: 1352px) calc(100vw - 3rem), 1320px"
            src="/homepage-hero.png"
            width={1536}
          />
        </section>
      </main>
    </PublicSiteShell>
  );
}
