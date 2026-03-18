import Link from "next/link";

import type {
  ApplicationApi,
  AuthenticatedViewer,
  PublicCommunitySummary,
} from "@/application";
import { PublicSiteShell } from "@/presentation/shared";

import styles from "./public-community-browse-page.module.css";

type PublicCommunityListQuery = Pick<ApplicationApi, "listPublicCommunities">;

export type PublicCommunityBrowsePageModel = {
  status: "success";
  communities: PublicCommunitySummary[];
};

type BuildDependencies = {
  publicCommunityQuery: PublicCommunityListQuery;
};

export const buildPublicCommunityBrowsePageModel = async (
  dependencies: BuildDependencies,
): Promise<PublicCommunityBrowsePageModel> => {
  const result = await dependencies.publicCommunityQuery.listPublicCommunities();

  return {
    status: "success",
    communities: result.communities,
  };
};

type PublicCommunityBrowsePageProps = {
  model: PublicCommunityBrowsePageModel;
  returnTo?: string;
  viewer?: AuthenticatedViewer | null;
  viewerProfileSlug?: string | null;
};

export const PublicCommunityBrowsePage = ({
  model,
  returnTo = "/communities",
  viewer = null,
  viewerProfileSlug = null,
}: PublicCommunityBrowsePageProps) => {
  return (
    <PublicSiteShell
      returnTo={returnTo}
      viewer={viewer}
      viewerProfileSlug={viewerProfileSlug}
    >
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Browse communities</p>
            <h1 className={styles.title}>See where supporters keep showing up</h1>
            <p className={styles.description}>
              Scroll through the current public communities, compare follower
              momentum, and open the spaces that are already connecting people to
              fundraisers and discussion.
            </p>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>{model.communities.length}</span>
              <span className={styles.heroStatLabel}>public communities</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>
                {model.communities.reduce(
                  (total, community) => total + community.followerCount,
                  0,
                )}
              </span>
              <span className={styles.heroStatLabel}>combined followers</span>
            </div>
          </div>
        </section>

        <section className={styles.gridSection}>
          {model.communities.length > 0 ? (
            <div className={styles.grid}>
              {model.communities.map((community) => (
                <Link
                  className={styles.card}
                  href={`/communities/${community.slug}`}
                  key={community.slug}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.communityBadge} aria-hidden="true">
                      {toInitials(community.name)}
                    </div>
                    <wa-badge appearance="outlined" pill>
                      {toTitleCase(community.visibility)}
                    </wa-badge>
                  </div>

                  <div className={styles.cardBody}>
                    <h2 className={styles.cardTitle}>{community.name}</h2>
                    <p className={styles.cardDescription}>{community.description}</p>
                  </div>

                  <div className={styles.statRow}>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>{community.followerCount}</span>
                      <span className={styles.statLabel}>followers</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>{community.fundraiserCount}</span>
                      <span className={styles.statLabel}>fundraisers</span>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <div>
                      <p className={styles.footerLabel}>Owner</p>
                      <p className={styles.footerValue}>{community.owner.displayName}</p>
                    </div>
                    <span className={styles.cardArrow} aria-hidden="true">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <section className={styles.emptyState}>
              <h2 className={styles.emptyTitle}>No public communities yet</h2>
              <p className={styles.emptyBody}>
                Seeded communities will appear here once they are ready for browsing.
              </p>
            </section>
          )}
        </section>
      </main>
    </PublicSiteShell>
  );
};

const toInitials = (value: string): string =>
  value
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

const toTitleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);
