import Link from "next/link";

import type {
  ApplicationApi,
  AuthenticatedViewer,
  PublicFundraiserBrowseEntry,
} from "@/application";
import { PublicSiteShell } from "@/presentation/shared";

import styles from "./public-fundraiser-browse-page.module.css";

type PublicFundraiserListQuery = Pick<ApplicationApi, "listPublicFundraisers">;

export type PublicFundraiserBrowsePageModel = {
  status: "success";
  fundraisers: PublicFundraiserBrowseEntry[];
};

type BuildDependencies = {
  publicFundraiserQuery: PublicFundraiserListQuery;
};

export const buildPublicFundraiserBrowsePageModel = async (
  dependencies: BuildDependencies,
): Promise<PublicFundraiserBrowsePageModel> => {
  const result = await dependencies.publicFundraiserQuery.listPublicFundraisers();

  return {
    status: "success",
    fundraisers: result.fundraisers,
  };
};

type PublicFundraiserBrowsePageProps = {
  model: PublicFundraiserBrowsePageModel;
  returnTo?: string;
  viewer?: AuthenticatedViewer | null;
  viewerProfileSlug?: string | null;
};

export const PublicFundraiserBrowsePage = ({
  model,
  returnTo = "/fundraisers",
  viewer = null,
  viewerProfileSlug = null,
}: PublicFundraiserBrowsePageProps) => {
  return (
    <PublicSiteShell
      returnTo={returnTo}
      viewer={viewer}
      viewerProfileSlug={viewerProfileSlug}
    >
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Browse fundraisers</p>
            <h1 className={styles.title}>Find public fundraisers with real momentum</h1>
            <p className={styles.description}>
              Explore current public campaigns, see who is organizing them,
              and jump straight into the fundraiser pages that already have active
              supporter energy.
            </p>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>{model.fundraisers.length}</span>
              <span className={styles.heroStatLabel}>public fundraisers</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>
                {model.fundraisers.filter((fundraiser) => fundraiser.status === "active").length}
              </span>
              <span className={styles.heroStatLabel}>active campaigns</span>
            </div>
          </div>
        </section>

        <section className={styles.gridSection}>
          {model.fundraisers.length > 0 ? (
            <div className={styles.grid}>
              {model.fundraisers.map((fundraiser) => {
                const progressPercentage = toGoalProgressPercentage(
                  fundraiser.amountRaised,
                  fundraiser.goalAmount,
                );

                return (
                  <Link
                    className={styles.card}
                    href={`/fundraisers/${fundraiser.slug}`}
                    key={fundraiser.slug}
                  >
                    <div className={styles.cardHeader}>
                      <wa-badge appearance="outlined" pill>
                        {toTitleCase(fundraiser.status)}
                      </wa-badge>
                      {fundraiser.community ? (
                        <wa-badge appearance="filled" pill variant="brand">
                          {fundraiser.community.name}
                        </wa-badge>
                      ) : null}
                    </div>

                    <div className={styles.cardBody}>
                      <h2 className={styles.cardTitle}>{fundraiser.title}</h2>
                      <p className={styles.cardDescription}>{fundraiser.storyExcerpt}</p>
                    </div>

                    <div className={styles.metricBlock}>
                      <div className={styles.metricHeadline}>
                        <span className={styles.metricValue}>
                          {formatCurrency(fundraiser.amountRaised)}
                        </span>
                        <span className={styles.metricContext}>
                          of {formatCompactCurrency(fundraiser.goalAmount)}
                        </span>
                      </div>

                      <div className={styles.progressTrack} aria-hidden="true">
                        <span
                          className={styles.progressFill}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>

                      <p className={styles.metricMeta}>
                        {fundraiser.supporterCount} supporters ·{" "}
                        {fundraiser.donationCount} donations
                      </p>
                    </div>

                    <div className={styles.cardFooter}>
                      <div>
                        <p className={styles.footerLabel}>Organizer</p>
                        <p className={styles.footerValue}>
                          {fundraiser.organizer.displayName}
                        </p>
                      </div>
                      <span className={styles.cardArrow} aria-hidden="true">
                        →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <section className={styles.emptyState}>
              <h2 className={styles.emptyTitle}>No public fundraisers yet</h2>
              <p className={styles.emptyBody}>
                Seeded campaigns will appear here once they are ready for browsing.
              </p>
            </section>
          )}
        </section>
      </main>
    </PublicSiteShell>
  );
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

const formatCompactCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(amount);

const toGoalProgressPercentage = (supportAmount: number, goalAmount: number): number => {
  if (goalAmount <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((supportAmount / goalAmount) * 100));
};

const toTitleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);
