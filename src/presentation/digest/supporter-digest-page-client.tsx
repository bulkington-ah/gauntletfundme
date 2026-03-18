"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { SupporterDigestResponse } from "@/application";

import { SupporterDigestAcknowledger } from "./supporter-digest-acknowledger";
import styles from "./supporter-digest-page.module.css";

type SupporterDigestPageClientProps = {
  digest: SupporterDigestResponse;
};

export function SupporterDigestPageClient({
  digest,
}: SupporterDigestPageClientProps) {
  const [currentDigest, setCurrentDigest] = useState(digest);

  useEffect(() => {
    setCurrentDigest(digest);
  }, [digest]);

  useEffect(() => {
    if (
      currentDigest.narration.status !== "pending" ||
      currentDigest.highlights.length === 0
    ) {
      return;
    }

    const abortController = new AbortController();

    void fetch("/api/engagement/digest-narration", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        windowStart: currentDigest.windowStart,
        windowEnd: currentDigest.windowEnd,
      }),
      signal: abortController.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        const body = await response
          .json()
          .catch(() => null) as { digest?: SupporterDigestResponse } | null;

        return body?.digest ?? null;
      })
      .then((nextDigest) => {
        if (nextDigest) {
          setCurrentDigest(nextDigest);
        }
      })
      .catch(() => undefined);

    return () => {
      abortController.abort();
    };
  }, [currentDigest]);

  return (
    <>
      <SupporterDigestAcknowledger viewedThrough={currentDigest.windowEnd} />

      <main className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Supporter digest</p>
          <div className={styles.headingRow}>
            <h1 className={styles.heading}>What changed since your last check-in</h1>
            {currentDigest.generationMode === "openai" ? (
              <span className={styles.modeBadge}>AI-assisted summary</span>
            ) : null}
          </div>
          <p className={styles.lead}>
            This digest watches the fundraisers and communities you follow, then
            pulls the most meaningful changes into one quick, grounded update.
          </p>
          <p className={styles.windowMeta}>
            Window: {formatDigestWindow(currentDigest.windowStart, currentDigest.windowEnd)}
          </p>
        </section>

        <section>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Highlights</h2>
          </div>

          {currentDigest.highlights.length === 0 ? (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyStateTitle}>Nothing new yet.</h3>
              <p className={styles.emptyStateBody}>
                The causes you follow are quiet for now. Check back after the next
                fundraiser push or community update.
              </p>
            </div>
          ) : (
            <div className={styles.highlightGrid}>
              {currentDigest.highlights.map((highlight) => (
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
    </>
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
