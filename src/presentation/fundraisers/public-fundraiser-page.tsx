import Link from "next/link";
import type {
  ApplicationApi,
  AuthenticatedViewer,
  PublicFundraiserResponse,
  PublicFundraiserSupporter,
} from "@/application";
import { PublicSiteShell } from "@/presentation/shared";

import styles from "./public-fundraiser-page.module.css";

type PublicFundraiserQuery = Pick<ApplicationApi, "getPublicFundraiserBySlug">;

type SuccessfulFundraiserPageModel = {
  status: "success";
  fundraiser: PublicFundraiserResponse["fundraiser"];
  organizer: PublicFundraiserResponse["organizer"];
  community: PublicFundraiserResponse["community"];
  recentSupporters: PublicFundraiserSupporter[];
};

export type PublicFundraiserPageModel =
  | SuccessfulFundraiserPageModel
  | {
      status: "invalid_request";
      message: string;
    }
  | {
      status: "not_found";
      slug: string;
      message: string;
    };

type BuildDependencies = {
  publicFundraiserQuery: PublicFundraiserQuery;
};

const fundraiserHeroImagePath = "/fundraiser-hero-warm-meals.svg";

export const buildPublicFundraiserPageModel = async (
  dependencies: BuildDependencies,
  slug: string,
): Promise<PublicFundraiserPageModel> => {
  const result = await dependencies.publicFundraiserQuery.getPublicFundraiserBySlug({
    slug,
  });

  switch (result.status) {
    case "success":
      return {
        status: "success",
        fundraiser: result.data.fundraiser,
        organizer: result.data.organizer,
        community: result.data.community,
        recentSupporters: result.data.recentSupporters,
      };
    case "invalid_request":
      return {
        status: "invalid_request",
        message: result.message,
      };
    case "not_found":
      return {
        status: "not_found",
        slug,
        message: result.message,
      };
  }
};

type PublicFundraiserPageProps = {
  model: PublicFundraiserPageModel;
  returnTo?: string;
  viewer?: AuthenticatedViewer | null;
  viewerProfileSlug?: string | null;
};

export const PublicFundraiserPage = ({
  model,
  returnTo = "/",
  viewer = null,
  viewerProfileSlug = null,
}: PublicFundraiserPageProps) => {
  if (model.status === "invalid_request") {
    return (
      <PublicSiteShell
        returnTo={returnTo}
        viewer={viewer}
        viewerProfileSlug={viewerProfileSlug}
      >
        <main className={styles.errorPage}>
          <section className={styles.errorCard}>
            <p className={styles.errorEyebrow}>Public fundraiser</p>
            <h1 className={styles.errorHeading}>Invalid fundraiser request</h1>
            <p className={styles.errorBody}>{model.message}</p>
            <div className={styles.errorActions}>
              <Link className={styles.primaryAction} href="/">
                Back home
              </Link>
              <Link
                className={styles.secondaryAction}
                href="/fundraisers/warm-meals-2026"
              >
                View seeded fundraiser
              </Link>
            </div>
          </section>
        </main>
      </PublicSiteShell>
    );
  }

  if (model.status === "not_found") {
    return (
      <PublicSiteShell
        returnTo={returnTo}
        viewer={viewer}
        viewerProfileSlug={viewerProfileSlug}
      >
        <main className={styles.errorPage}>
          <section className={styles.errorCard}>
            <p className={styles.errorEyebrow}>Public fundraiser</p>
            <h1 className={styles.errorHeading}>Fundraiser not found</h1>
            <p className={styles.errorBody}>
              {model.message} Tried slug: <strong>{model.slug}</strong>
            </p>
            <div className={styles.errorActions}>
              <Link className={styles.primaryAction} href="/">
                Back home
              </Link>
              <Link
                className={styles.secondaryAction}
                href="/fundraisers/warm-meals-2026"
              >
                View seeded fundraiser
              </Link>
            </div>
          </section>
        </main>
      </PublicSiteShell>
    );
  }

  const fundraiserStatus = toTitleCase(model.fundraiser.status);
  const organizerRole = toTitleCase(model.organizer.role);
  const goalProgress = toGoalProgressPercentage(
    model.fundraiser.supportAmount,
    model.fundraiser.goalAmount,
  );
  const storyParagraphs = buildStoryParagraphs(model);
  const organizerFirstName = getFirstName(model.organizer.displayName);

  return (
    <PublicSiteShell
      returnTo={returnTo}
      viewer={viewer}
      viewerProfileSlug={viewerProfileSlug}
    >
      <main className={styles.page}>
        <section className={styles.headline}>
          <div className={styles.headlineCopy}>
            <p className={styles.eyebrow}>Community fundraiser</p>
            <h1 className={styles.headlineTitle}>{model.fundraiser.title}</h1>
            <p className={styles.headlineMeta}>
              Organized by {model.organizer.displayName}
              {model.community ? ` for ${model.community.name}` : ""} · {fundraiserStatus}
            </p>
          </div>

          <div className={styles.headlineBadges}>
            <wa-badge
              className={styles.statusBadge}
              appearance="filled"
              pill
              variant="brand"
            >
              Prototype fundraiser
            </wa-badge>
            {model.community ? (
              <wa-badge className={styles.contextBadge} appearance="outlined" pill>
                {toTitleCase(model.community.visibility)} community
              </wa-badge>
            ) : null}
          </div>
        </section>

        <div className={styles.layout}>
          <div className={styles.mainColumn}>
            <section className={styles.mediaCard}>
              <div className={styles.mediaFrame}>
                <img
                  alt="Warm meal deliveries staged for neighborhood pickup"
                  className={styles.mediaImage}
                  src={fundraiserHeroImagePath}
                />

                <div className={styles.mediaDots} aria-hidden="true">
                  <span className={`${styles.mediaDot} ${styles.mediaDotActive}`} />
                  <span className={styles.mediaDot} />
                  <span className={styles.mediaDot} />
                </div>

                <div className={styles.mediaControls} aria-hidden="true">
                  <button className={styles.mediaControl} disabled type="button">
                    ←
                  </button>
                  <button className={styles.mediaControl} disabled type="button">
                    →
                  </button>
                </div>
              </div>
            </section>

            <section className={styles.mobileSupportCard}>
              <div className={styles.mobileSupportBanner}>
                Help {organizerFirstName} keep meals moving this week.
              </div>

              <SupportProgressDetails
                className={styles.mobileSupportStats}
                fundraiser={model.fundraiser}
                goalProgress={goalProgress}
              />

              <div className={styles.mobileSupportActions}>
                <a
                  className={styles.primaryAction}
                  href={`/fundraisers/${model.fundraiser.slug}?checkout=mock`}
                >
                  Donate now
                </a>
                <button className={styles.secondaryAction} type="button">
                  Share
                </button>
              </div>
            </section>

            <section className={styles.organizerCard}>
              <div className={styles.organizerHeader}>
                <div className={styles.organizerAvatar} aria-hidden="true">
                  {toInitials(model.organizer.displayName)}
                </div>

                <div className={styles.organizerCopy}>
                  <p className={styles.organizerLine}>
                    {model.organizer.profileSlug ? (
                      <a
                        className={styles.organizerLink}
                        href={`/profiles/${model.organizer.profileSlug}`}
                      >
                        {model.organizer.displayName}
                      </a>
                    ) : (
                      <span className={styles.organizerName}>
                        {model.organizer.displayName}
                      </span>
                    )}{" "}
                    is organizing this fundraiser
                    {model.community ? (
                      <>
                        {" "}
                        for{" "}
                        <a
                          className={styles.organizerLink}
                          href={`/communities/${model.community.slug}`}
                        >
                          {model.community.name}
                        </a>
                      </>
                    ) : null}
                  </p>
                  <p className={styles.organizerMeta}>
                    {organizerRole} · Goal {formatCompactCurrency(model.fundraiser.goalAmount)}
                  </p>
                </div>
              </div>

              <div className={styles.organizerBadges}>
                <wa-badge className={styles.supportBadge} appearance="outlined" pill>
                  {model.fundraiser.supporterCount} supporters
                </wa-badge>
                <wa-badge className={styles.supportBadge} appearance="outlined" pill>
                  {model.fundraiser.donationIntentCount} mock donations
                </wa-badge>
              </div>
            </section>

            <section className={styles.storyCard}>
              <div className={styles.storyHeader}>
                <h2 className={styles.storyTitle}>Story</h2>
                <p className={styles.storyLead}>
                  A focused public fundraiser experience built for clarity,
                  momentum, and community trust.
                </p>
              </div>

              <div className={styles.storyBody}>
                {storyParagraphs.map((paragraph) => (
                  <p className={styles.storyParagraph} key={paragraph}>
                    {paragraph}
                  </p>
                ))}
              </div>

              <wa-divider className={styles.divider} />

              <div className={styles.reactionRow}>
                <div className={styles.reaction}>
                  <span className={styles.reactionIcon} aria-hidden="true">
                    ♡
                  </span>
                  <span>React</span>
                </div>
                <div className={styles.reactionCount}>
                  <span aria-hidden="true">✦</span>
                  <span>{model.fundraiser.supporterCount}</span>
                </div>
              </div>

              <div className={styles.actionRow}>
                <a
                  className={styles.primaryAction}
                  href={`/fundraisers/${model.fundraiser.slug}?checkout=mock`}
                >
                  Donate now
                </a>
                <button className={styles.secondaryAction} type="button">
                  Share
                </button>
              </div>
            </section>

            <section className={styles.promoBand}>
              <p className={styles.promoEyebrow}>Keep the response moving</p>
              <h2 className={styles.promoTitle}>
                Help {organizerFirstName} grow neighborhood support beyond a single
                campaign.
              </h2>
              <p className={styles.promoBody}>
                The shared public shell makes it easy to move from this fundraiser
                into the connected community and organizer profile without losing
                context.
              </p>
              <div className={styles.promoActions}>
                {model.community ? (
                  <a
                    className={styles.primaryAction}
                    href={`/communities/${model.community.slug}`}
                  >
                    View community
                  </a>
                ) : null}
                {model.organizer.profileSlug ? (
                  <a
                    className={styles.secondaryAction}
                    href={`/profiles/${model.organizer.profileSlug}`}
                  >
                    View organizer
                  </a>
                ) : null}
              </div>
            </section>
          </div>

          <aside className={styles.sidebarColumn}>
            <section className={styles.sidebarCard}>
              <div className={styles.sidebarBanner}>
                Help {organizerFirstName} keep meals moving this week.
              </div>

              <SupportProgressDetails
                className={styles.sidebarStats}
                fundraiser={model.fundraiser}
                goalProgress={goalProgress}
              />

              <div className={styles.sidebarActions}>
                <a
                  className={styles.primaryAction}
                  href={`/fundraisers/${model.fundraiser.slug}?checkout=mock`}
                >
                  Donate now
                </a>
                <button className={styles.sidebarSecondaryAction} type="button">
                  Share
                </button>
              </div>

              <div className={styles.supportersHeader}>
                <h2 className={styles.supportersTitle}>Recent supporters</h2>
                <p className={styles.supportersCount}>
                  {model.recentSupporters.length} visible in the prototype feed
                </p>
              </div>

              <ul className={styles.supportersList}>
                {model.recentSupporters.map((supporter) => (
                  <SupporterListItem key={`${supporter.displayName}-${supporter.createdAt}`} supporter={supporter} />
                ))}
              </ul>

              <div className={styles.sidebarFooter}>
                <button className={styles.footerButton} type="button">
                  See all
                </button>
                <button className={styles.footerButton} type="button">
                  See top
                </button>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </PublicSiteShell>
  );
};

type SupporterListItemProps = {
  supporter: PublicFundraiserSupporter;
};

type SupportProgressDetailsProps = {
  className: string;
  fundraiser: SuccessfulFundraiserPageModel["fundraiser"];
  goalProgress: number;
};

const SupportProgressDetails = ({
  className,
  fundraiser,
  goalProgress,
}: SupportProgressDetailsProps) => (
  <div className={className}>
    <div className={styles.supportSummary}>
      <p className={styles.supportAmount}>
        {formatCurrency(fundraiser.supportAmount)} in prototype support
      </p>
      <p className={styles.supportMeta}>
        Goal {formatCompactCurrency(fundraiser.goalAmount)} ·{" "}
        {fundraiser.supporterCount} supporters · {fundraiser.donationIntentCount}{" "}
        support actions
      </p>
    </div>

    <div className={styles.progressBarGroup}>
      <p className={styles.progressBarLabel}>{goalProgress}% of goal</p>
      <wa-progress-bar
        className={styles.progressBar}
        label={`${goalProgress}% of goal represented by prototype support`}
        value={goalProgress}
      />
    </div>
  </div>
);

const SupporterListItem = ({ supporter }: SupporterListItemProps) => (
  <li className={styles.supporterItem}>
    <div className={styles.supporterAvatar} aria-hidden="true">
      {toInitials(supporter.displayName)}
    </div>

    <div className={styles.supporterDetails}>
      <div className={styles.supporterNameRow}>
        <span className={styles.supporterName}>{supporter.displayName}</span>
        <span className={styles.supporterDate}>
          {formatSupporterDate(supporter.createdAt)}
        </span>
      </div>
      <p className={styles.supporterMeta}>
        {formatCurrency(supporter.amount)} ·{" "}
        <span
          className={
            supporter.status === "completed"
              ? styles.supporterStatusComplete
              : styles.supporterStatusStarted
          }
        >
          {toTitleCase(supporter.status)}
        </span>
      </p>
    </div>
  </li>
);

const buildStoryParagraphs = (model: SuccessfulFundraiserPageModel): string[] => {
  const paragraphs = [model.fundraiser.story];

  if (model.community) {
    paragraphs.push(
      `Every support action in this prototype helps ${model.community.name} stay stocked, scheduled, and ready for the next round of neighborhood meal deliveries.`,
    );
  }

  paragraphs.push(
    `${model.fundraiser.supporterCount} supporters have already started or completed ${model.fundraiser.donationIntentCount} mocked donation flows toward the ${formatCurrency(model.fundraiser.goalAmount)} goal. This public route keeps that momentum visible without implying real payment processing.`,
  );

  return paragraphs;
};

const getFirstName = (displayName: string): string => displayName.split(" ")[0] ?? displayName;

const toInitials = (value: string): string =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const toTitleCase = (value: string): string =>
  value
    .split("_")
    .flatMap((word) => word.split(" "))
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const formatCompactCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(value);

const formatSupporterDate = (value: string): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));

const toGoalProgressPercentage = (supportAmount: number, goalAmount: number): number => {
  if (goalAmount <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round((supportAmount / goalAmount) * 100)));
};
