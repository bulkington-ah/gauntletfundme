import Link from "next/link";
import type {
  ApplicationApi,
  AuthenticatedViewer,
  PublicCommunityResponse,
} from "@/application";
import { FollowTargetControl } from "@/presentation/engagement";
import { PublicSiteShell } from "@/presentation/shared";

import { CommunityActivityPanel } from "./community-activity-panel";
import styles from "./public-community-page.module.css";

type PublicCommunityQuery = Pick<ApplicationApi, "getPublicCommunityBySlug">;

type SuccessfulCommunityPageModel = {
  status: "success";
  viewerFollowState: PublicCommunityResponse["viewerFollowState"];
  community: PublicCommunityResponse["community"];
  owner: PublicCommunityResponse["owner"];
  featuredFundraiser: PublicCommunityResponse["featuredFundraiser"];
  leaderboard: PublicCommunityResponse["leaderboard"];
  fundraisers: PublicCommunityResponse["fundraisers"];
  discussion: PublicCommunityResponse["discussion"];
};

export type PublicCommunityPageModel =
  | SuccessfulCommunityPageModel
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
  publicCommunityQuery: PublicCommunityQuery;
};

export const buildPublicCommunityPageModel = async (
  dependencies: BuildDependencies,
  slug: string,
  viewerUserId: string | null = null,
): Promise<PublicCommunityPageModel> => {
  const result = await dependencies.publicCommunityQuery.getPublicCommunityBySlug({
    slug,
    viewerUserId,
  });

  switch (result.status) {
    case "success":
      return {
        status: "success",
        viewerFollowState: result.data.viewerFollowState,
        community: result.data.community,
        owner: result.data.owner,
        featuredFundraiser: result.data.featuredFundraiser,
        leaderboard: result.data.leaderboard,
        fundraisers: result.data.fundraisers,
        discussion: result.data.discussion,
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

type PublicCommunityPageProps = {
  model: PublicCommunityPageModel;
  returnTo?: string;
  viewer?: AuthenticatedViewer | null;
  viewerProfileSlug?: string | null;
};

export const PublicCommunityPage = ({
  model,
  returnTo = "/",
  viewer = null,
  viewerProfileSlug = null,
}: PublicCommunityPageProps) => {
  if (model.status === "invalid_request") {
    return (
      <PublicSiteShell
        returnTo={returnTo}
        viewer={viewer}
        viewerProfileSlug={viewerProfileSlug}
      >
        <main className={styles.errorPage}>
          <section className={styles.errorCard}>
            <p className={styles.errorEyebrow}>Public community</p>
            <h1 className={styles.errorHeading}>Invalid community request</h1>
            <p className={styles.errorBody}>{model.message}</p>
            <div className={styles.errorActions}>
              <Link className={styles.primaryAction} href="/">
                Back home
              </Link>
              <Link
                className={styles.secondaryAction}
                href="/communities"
              >
                Browse communities
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
            <p className={styles.errorEyebrow}>Public community</p>
            <h1 className={styles.errorHeading}>Community not found</h1>
            <p className={styles.errorBody}>
              {model.message} Tried slug: <strong>{model.slug}</strong>
            </p>
            <div className={styles.errorActions}>
              <Link className={styles.primaryAction} href="/">
                Back home
              </Link>
              <Link
                className={styles.secondaryAction}
                href="/communities"
              >
                Browse communities
              </Link>
            </div>
          </section>
        </main>
      </PublicSiteShell>
    );
  }

  const ownerInitials = toInitials(model.owner.displayName);
  const communityInitials = toInitials(model.community.name);
  const canCreatePost =
    model.viewerFollowState?.isOwnTarget === true ||
    viewer?.role === "moderator" ||
    viewer?.role === "admin";

  return (
    <PublicSiteShell
      returnTo={returnTo}
      viewer={viewer}
      viewerProfileSlug={viewerProfileSlug}
    >
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Community</p>
            <h1 className={styles.heroTitle}>{model.community.name}</h1>
            <p className={styles.heroBody}>{model.community.description}</p>

            <div className={styles.communityMeta}>
              <div className={styles.communityIcon} aria-hidden="true">
                {communityInitials}
              </div>
              <div className={styles.metaCopy}>
                <p className={styles.metaPrimary}>
                  {model.community.followerCount} followers
                </p>
                <p className={styles.metaSecondary}>
                  {toTitleCase(model.community.visibility)} community
                </p>
              </div>
            </div>

            <div className={styles.ctaRow}>
              {model.featuredFundraiser ? (
                <a
                  className={styles.primaryAction}
                  href={`/fundraisers/${model.featuredFundraiser.slug}`}
                >
                  View featured fundraiser
                </a>
              ) : null}
              {model.owner.profileSlug ? (
                <a
                  className={styles.secondaryAction}
                  href={`/profiles/${model.owner.profileSlug}`}
                >
                  View owner profile
                </a>
              ) : null}
              <FollowTargetControl
                buttonClassName={styles.followButton}
                initialFollowState={model.viewerFollowState}
                nextPath={returnTo}
                targetSlug={model.community.slug}
                targetType="community"
                viewer={viewer}
              />
            </div>

            <div className={styles.statsRow}>
              <div className={styles.stat}>
                <p className={styles.statValue}>
                  {formatCompactCurrency(model.community.amountRaised)}
                </p>
                <p className={styles.statLabel}>raised</p>
              </div>
              <div className={styles.stat}>
                <p className={styles.statValue}>{model.community.donationCount}</p>
                <p className={styles.statLabel}>donations</p>
              </div>
              <div className={styles.stat}>
                <p className={styles.statValue}>{model.community.fundraiserCount}</p>
                <p className={styles.statLabel}>fundraisers</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.leaderboardSection}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Leaderboard</p>
              <h2 className={styles.sectionTitle}>Top fundraiser momentum</h2>
            </div>
            <wa-badge className={styles.sectionBadge} appearance="outlined" pill>
              {model.leaderboard.length} active cards
            </wa-badge>
          </div>

          <div className={styles.leaderboardGrid}>
            {model.leaderboard.map((entry) => (
              <a
                className={`${styles.leaderboardCard} ${
                  entry.rank === 1
                    ? styles.rankOne
                    : entry.rank === 2
                      ? styles.rankTwo
                      : styles.rankThree
                }`}
                href={`/fundraisers/${entry.fundraiser.slug}`}
                key={entry.fundraiser.slug}
              >
                <div className={styles.rankMedal}>{entry.rank}</div>
                <p className={styles.leaderboardName}>{entry.fundraiser.title}</p>
                <p className={styles.leaderboardRaised}>
                  {formatCurrency(entry.fundraiser.amountRaised)}
                </p>
                <p className={styles.leaderboardMeta}>
                  {entry.fundraiser.supporterCount} supporters ·{" "}
                  {entry.fundraiser.donationCount} donations
                </p>
              </a>
            ))}
          </div>
        </section>

        <section className={styles.tabsSection}>
          <wa-tab-group active="activity" className={styles.tabGroup}>
            <wa-tab panel="activity">Activity</wa-tab>
            <wa-tab panel="fundraisers">Fundraisers</wa-tab>
            <wa-tab panel="about">About</wa-tab>

            <wa-tab-panel active className={styles.tabPanel} name="activity">
              <CommunityActivityPanel
                canCreatePost={canCreatePost}
                communitySlug={model.community.slug}
                discussion={model.discussion}
                nextPath={returnTo}
                viewer={viewer}
              />
            </wa-tab-panel>

            <wa-tab-panel className={styles.tabPanel} name="fundraisers">
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Fundraisers</p>
                  <h2 className={styles.panelTitle}>Campaigns in this community</h2>
                </div>
                <wa-badge className={styles.sectionBadge} appearance="outlined" pill>
                  {model.fundraisers.length} total
                </wa-badge>
              </div>

              <div className={styles.fundraiserGrid}>
                {model.fundraisers.map((fundraiser) => (
                  <a
                    className={styles.fundraiserCard}
                    href={`/fundraisers/${fundraiser.slug}`}
                    key={fundraiser.slug}
                  >
                    <p className={styles.fundraiserTitle}>{fundraiser.title}</p>
                    <div className={styles.fundraiserProgress}>
                      <div
                        className={styles.fundraiserProgressFill}
                        style={{
                          width: `${toGoalProgressPercentage(
                            fundraiser.amountRaised,
                            fundraiser.goalAmount,
                          )}%`,
                        }}
                      />
                    </div>
                    <p className={styles.fundraiserRaised}>
                      {formatCurrency(fundraiser.amountRaised)} raised
                    </p>
                    <p className={styles.fundraiserMeta}>
                      Goal {formatCompactCurrency(fundraiser.goalAmount)} ·{" "}
                      {fundraiser.supporterCount} supporters ·{" "}
                      {toTitleCase(fundraiser.status)}
                    </p>
                  </a>
                ))}
              </div>
            </wa-tab-panel>

            <wa-tab-panel className={styles.tabPanel} name="about">
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>About</p>
                  <h2 className={styles.panelTitle}>What this community supports</h2>
                </div>
              </div>

              <div className={styles.aboutGrid}>
                <section className={styles.aboutCard}>
                  <h3 className={styles.aboutCardTitle}>Community summary</h3>
                  <p className={styles.aboutBody}>{model.community.description}</p>
                  <p className={styles.aboutMeta}>
                    Visibility: {toTitleCase(model.community.visibility)}
                  </p>
                </section>

                <section className={styles.aboutCard}>
                  <h3 className={styles.aboutCardTitle}>Owner</h3>
                  {model.owner.profileSlug ? (
                    <Link
                      className={styles.ownerLink}
                      href={`/profiles/${model.owner.profileSlug}`}
                    >
                      <div className={styles.ownerRow}>
                        <div className={styles.ownerAvatar} aria-hidden="true">
                          {ownerInitials}
                        </div>
                        <div>
                          <p className={styles.ownerName}>{model.owner.displayName}</p>
                          <p className={styles.ownerRole}>
                            {toTitleCase(model.owner.role)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className={styles.ownerRow}>
                      <div className={styles.ownerAvatar} aria-hidden="true">
                        {ownerInitials}
                      </div>
                      <div>
                        <p className={styles.ownerName}>{model.owner.displayName}</p>
                        <p className={styles.ownerRole}>
                          {toTitleCase(model.owner.role)}
                        </p>
                      </div>
                    </div>
                  )}
                  {model.owner.profileSlug ? (
                    <a
                      className={styles.inlineLink}
                      href={`/profiles/${model.owner.profileSlug}`}
                    >
                      View owner profile
                    </a>
                  ) : null}
                </section>

                <section className={styles.aboutCard}>
                  <h3 className={styles.aboutCardTitle}>Featured fundraiser</h3>
                  {model.featuredFundraiser ? (
                    <>
                      <a
                        className={styles.inlineLink}
                        href={`/fundraisers/${model.featuredFundraiser.slug}`}
                      >
                        {model.featuredFundraiser.title}
                      </a>
                      <p className={styles.aboutMeta}>
                        {formatCurrency(model.featuredFundraiser.amountRaised)} raised
                      </p>
                    </>
                  ) : (
                    <p className={styles.aboutBody}>No featured fundraiser yet.</p>
                  )}
                </section>
              </div>
            </wa-tab-panel>
          </wa-tab-group>
        </section>
      </main>
    </PublicSiteShell>
  );
};

const toTitleCase = (value: string): string =>
  value
    .split("_")
    .flatMap((word) => word.split(" "))
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");

const toInitials = (value: string): string =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

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

const toGoalProgressPercentage = (supportAmount: number, goalAmount: number): number => {
  if (goalAmount <= 0) {
    return 0;
  }

  return Math.max(6, Math.min(100, Math.round((supportAmount / goalAmount) * 100)));
};
