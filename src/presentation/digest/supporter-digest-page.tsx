import Link from "next/link";

import type {
  AuthenticatedViewer,
  SupporterDigestResponse,
} from "@/application";
import { PublicSiteShell } from "@/presentation/shared";

import { SupporterDigestAcknowledger } from "./supporter-digest-acknowledger";
import styles from "./supporter-digest-page.module.css";

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
      <SupporterDigestAcknowledger viewedThrough={digest.windowEnd} />

      <main className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Supporter digest</p>
          <div className={styles.headingRow}>
            <h1 className={styles.heading}>What changed since your last check-in</h1>
            <span className={styles.modeBadge}>
              {digest.generationMode === "openai"
                ? "AI-assisted summary"
                : "Grounded fallback summary"}
            </span>
          </div>
          <p className={styles.lead}>
            This digest watches the fundraisers and communities you follow, then
            pulls the most meaningful changes into one quick, grounded update.
          </p>
          <p className={styles.windowMeta}>
            Window: {formatDigestWindow(digest.windowStart, digest.windowEnd)}
          </p>

          {digest.generationMode === "deterministic" ? (
            <p className={styles.fallbackNote}>
              AI narration is unavailable right now, so you&apos;re seeing the
              deterministic digest copy instead.
            </p>
          ) : null}
        </section>

        <section>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Highlights</h2>
          </div>

          {digest.highlights.length === 0 ? (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyStateTitle}>Nothing new yet.</h3>
              <p className={styles.emptyStateBody}>
                The causes you follow are quiet for now. Check back after the next
                fundraiser push or community update.
              </p>
            </div>
          ) : (
            <div className={styles.highlightGrid}>
              {digest.highlights.map((highlight) => (
                <article className={styles.highlightCard} key={highlight.id}>
                  <div className={styles.highlightMeta}>
                    <span className={styles.highlightType}>
                      {toHighlightLabel(highlight.type)}
                    </span>
                    <time
                      className={styles.highlightTime}
                      dateTime={highlight.occurredAt}
                    >
                      {formatOccurredAt(highlight.occurredAt)}
                    </time>
                  </div>
                  <h3 className={styles.highlightHeadline}>{highlight.headline}</h3>
                  <p className={styles.highlightBody}>{highlight.body}</p>
                  <Link className={styles.highlightCta} href={highlight.href}>
                    {highlight.ctaLabel}
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </PublicSiteShell>
  );
}

const toHighlightLabel = (value: SupporterDigestResponse["highlights"][number]["type"]) =>
  value
    .split("_")
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");

const formatOccurredAt = (value: string): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const formatDigestWindow = (windowStart: string, windowEnd: string): string => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formatter.format(new Date(windowStart))} to ${formatter.format(
    new Date(windowEnd),
  )}`;
};
