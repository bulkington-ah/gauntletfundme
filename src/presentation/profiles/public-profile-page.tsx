import type {
  ApplicationApi,
  PublicProfileResponse,
} from "@/application";
import { PublicSiteShell } from "@/presentation/shared";

import styles from "./public-profile-page.module.css";

type PublicProfileQuery = Pick<ApplicationApi, "getPublicProfileBySlug">;

type SuccessfulProfilePageModel = {
  status: "success";
  profile: PublicProfileResponse["profile"];
  connections: PublicProfileResponse["connections"];
  recentActivity: PublicProfileResponse["recentActivity"];
};

export type PublicProfilePageModel =
  | SuccessfulProfilePageModel
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
  publicProfileQuery: PublicProfileQuery;
};

const topCauseCards = [
  {
    title: "Food security",
    symbol: "✳",
    toneClassName: styles.causeFood,
  },
  {
    title: "Community care",
    symbol: "◌",
    toneClassName: styles.causeCare,
  },
  {
    title: "Mutual aid",
    symbol: "✦",
    toneClassName: styles.causeAid,
  },
];

export const buildPublicProfilePageModel = async (
  dependencies: BuildDependencies,
  slug: string,
): Promise<PublicProfilePageModel> => {
  const result = await dependencies.publicProfileQuery.getPublicProfileBySlug({
    slug,
  });

  switch (result.status) {
    case "success":
      return {
        status: "success",
        profile: result.data.profile,
        connections: result.data.connections,
        recentActivity: result.data.recentActivity,
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

type PublicProfilePageProps = {
  model: PublicProfilePageModel;
};

export const PublicProfilePage = ({ model }: PublicProfilePageProps) => {
  if (model.status === "invalid_request") {
    return (
      <PublicSiteShell>
        <main className={styles.errorPage}>
          <section className={styles.errorCard}>
            <p className={styles.errorEyebrow}>Public profile</p>
            <h1 className={styles.errorHeading}>Invalid profile request</h1>
            <p className={styles.errorBody}>{model.message}</p>
            <div className={styles.errorActions}>
              <a className={styles.primaryAction} href="/">
                Back home
              </a>
              <a className={styles.secondaryAction} href="/profiles/avery-johnson">
                View seeded profile
              </a>
            </div>
          </section>
        </main>
      </PublicSiteShell>
    );
  }

  if (model.status === "not_found") {
    return (
      <PublicSiteShell>
        <main className={styles.errorPage}>
          <section className={styles.errorCard}>
            <p className={styles.errorEyebrow}>Public profile</p>
            <h1 className={styles.errorHeading}>Profile not found</h1>
            <p className={styles.errorBody}>
              {model.message} Tried slug: <strong>{model.slug}</strong>
            </p>
            <div className={styles.errorActions}>
              <a className={styles.primaryAction} href="/">
                Back home
              </a>
              <a className={styles.secondaryAction} href="/profiles/avery-johnson">
                View seeded profile
              </a>
            </div>
          </section>
        </main>
      </PublicSiteShell>
    );
  }

  const profileInitials = toInitials(model.profile.displayName);
  const discoverPeople = buildDiscoverPeople(model);

  return (
    <PublicSiteShell>
      <main className={styles.page}>
        <section className={styles.profileHero}>
          <div className={styles.coverArt} aria-hidden="true">
            <div className={styles.coverShapePrimary} />
            <div className={styles.coverShapeSecondary} />
            <div className={styles.coverShapeTertiary} />
          </div>

          <div className={styles.heroContent}>
            <div className={styles.avatarWrap}>
              <div className={styles.avatar} aria-hidden="true">
                {profileInitials}
              </div>
            </div>

            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Public profile</p>
              <h1 className={styles.profileName}>{model.profile.displayName}</h1>
              <p className={styles.profileMeta}>
                {toTitleCase(model.profile.profileType)} profile ·{" "}
                {toTitleCase(model.profile.role)} role
              </p>
              <p className={styles.profileBio}>{model.profile.bio}</p>

              <wa-badge className={styles.impactBadge} appearance="filled" pill variant="brand">
                Inspired {model.profile.inspiredSupporterCount} people to help
              </wa-badge>

              <div className={styles.counterRow}>
                <p className={styles.counter}>
                  <span className={styles.counterValue}>
                    {model.profile.followerCount}
                  </span>{" "}
                  followers
                </p>
                <p className={styles.counter}>
                  <span className={styles.counterValue}>
                    {model.profile.followingCount}
                  </span>{" "}
                  following
                </p>
              </div>

              <div className={styles.heroActions}>
                <button className={styles.followButton} type="button">
                  Follow
                </button>
                <button className={styles.moreButton} type="button">
                  ...
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.discoverStrip}>
          <div>
            <p className={styles.sectionEyebrow}>Discover</p>
            <h2 className={styles.sectionTitle}>Discover more people</h2>
          </div>

          <div className={styles.discoverPreview}>
            <div className={styles.discoverAvatars}>
              {discoverPeople.map((person) => (
                <div className={styles.discoverAvatar} key={person}>
                  {toInitials(person)}
                </div>
              ))}
            </div>
            <button className={styles.discoverToggle} type="button">
              ˅
            </button>
          </div>
        </section>

        <section className={styles.causesSection}>
          <div className={styles.centeredHeader}>
            <p className={styles.sectionEyebrow}>Top causes</p>
            <h2 className={styles.sectionTitle}>Areas this organizer shows up for</h2>
          </div>

          <div className={styles.causesGrid}>
            {topCauseCards.map((cause) => (
              <article className={styles.causeCard} key={cause.title}>
                <div className={`${styles.causeIcon} ${cause.toneClassName}`} aria-hidden="true">
                  {cause.symbol}
                </div>
                <p className={styles.causeTitle}>{cause.title}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.highlightsSection}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Highlights</p>
              <h2 className={styles.sectionTitle}>Fundraiser momentum</h2>
            </div>
            <wa-badge className={styles.sectionBadge} appearance="outlined" pill>
              {model.connections.fundraisers.length} live cards
            </wa-badge>
          </div>

          <div className={styles.highlightGrid}>
            {model.connections.fundraisers.length > 0 ? (
              model.connections.fundraisers.map((fundraiser) => (
                <a
                  className={styles.highlightCard}
                  href={`/fundraisers/${fundraiser.slug}`}
                  key={fundraiser.slug}
                >
                  <div className={styles.highlightMedia} aria-hidden="true">
                    {toInitials(fundraiser.title)}
                  </div>
                  <div className={styles.highlightContent}>
                    <p className={styles.highlightTitle}>{fundraiser.title}</p>
                    <div className={styles.highlightProgress}>
                      <div
                        className={styles.highlightProgressFill}
                        style={{
                          width: `${toGoalProgressPercentage(
                            fundraiser.supportAmount,
                            fundraiser.goalAmount,
                          )}%`,
                        }}
                      />
                    </div>
                    <p className={styles.highlightRaised}>
                      {formatCurrency(fundraiser.supportAmount)} in prototype support
                    </p>
                    <p className={styles.highlightMeta}>
                      Goal {formatCompactCurrency(fundraiser.goalAmount)} ·{" "}
                      {fundraiser.supporterCount} supporters ·{" "}
                      {toTitleCase(fundraiser.status)}
                    </p>
                  </div>
                </a>
              ))
            ) : (
              <p className={styles.emptyState}>No connected fundraisers yet.</p>
            )}
          </div>
        </section>

        <section className={styles.communitiesSection}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Communities</p>
              <h2 className={styles.sectionTitle}>Connected community spaces</h2>
            </div>
          </div>

          <div className={styles.communityLinks}>
            {model.connections.communities.length > 0 ? (
              model.connections.communities.map((community) => (
                <a
                  className={styles.communityPill}
                  href={`/communities/${community.slug}`}
                  key={community.slug}
                >
                  <span>{community.name}</span>
                  <wa-badge appearance="outlined" pill>
                    {toTitleCase(community.visibility)}
                  </wa-badge>
                </a>
              ))
            ) : (
              <p className={styles.emptyState}>No connected communities yet.</p>
            )}
          </div>
        </section>

        <section className={styles.activitySection}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Activity</p>
              <h2 className={styles.sectionTitle}>Recent public activity</h2>
            </div>
          </div>

          <div className={styles.activityFeed}>
            {model.recentActivity.length > 0 ? (
              model.recentActivity.map((entry) => (
                <article className={styles.activityCard} key={entry.id}>
                  <div className={styles.activityHeader}>
                    <div className={styles.activityAvatar} aria-hidden="true">
                      {toInitials(entry.actor.displayName)}
                    </div>
                    <div className={styles.activityMeta}>
                      <p className={styles.activityActor}>{entry.actor.displayName}</p>
                      <p className={styles.activityDate}>{formatDate(entry.createdAt)}</p>
                    </div>
                    <button className={styles.activityMoreButton} type="button">
                      ...
                    </button>
                  </div>

                  <div className={styles.activityContent}>
                    <p className={styles.activitySummary}>{entry.summary}</p>
                    {entry.amount !== null ? (
                      <p className={styles.activityAmount}>
                        {formatCurrency(entry.amount)} toward a fundraiser
                      </p>
                    ) : null}
                    {entry.detail ? (
                      <p className={styles.activityDetail}>{entry.detail}</p>
                    ) : null}
                  </div>

                  <div className={styles.activityLinks}>
                    {entry.fundraiser ? (
                      <a
                        className={styles.inlineLink}
                        href={`/fundraisers/${entry.fundraiser.slug}`}
                      >
                        Benefiting {entry.fundraiser.title}
                      </a>
                    ) : null}
                    {entry.community ? (
                      <a
                        className={styles.inlineLink}
                        href={`/communities/${entry.community.slug}`}
                      >
                        In {entry.community.name}
                      </a>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <p className={styles.emptyState}>No recent activity yet.</p>
            )}
          </div>
        </section>
      </main>
    </PublicSiteShell>
  );
};

const buildDiscoverPeople = (model: SuccessfulProfilePageModel): string[] => {
  const activityNames = model.recentActivity
    .map((entry) => entry.actor.displayName)
    .filter((name) => name !== model.profile.displayName);

  const communityNames = model.connections.communities.map((community) => community.name);

  return [...new Set([...activityNames, ...communityNames])].slice(0, 3);
};

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
    maximumFractionDigits: 1,
  }).format(value);

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));

const toGoalProgressPercentage = (supportAmount: number, goalAmount: number): number => {
  if (goalAmount <= 0) {
    return 0;
  }

  return Math.max(6, Math.min(100, Math.round((supportAmount / goalAmount) * 100)));
};
