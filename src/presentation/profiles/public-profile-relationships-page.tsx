import Link from "next/link";

import type { AuthenticatedViewer } from "@/application";
import { PublicSiteShell } from "@/presentation/shared";

import { PublicProfilePage, type PublicProfilePageModel } from "./public-profile-page";
import styles from "./public-profile-relationships-page.module.css";

export type ProfileRelationshipKind = "followers" | "following";

type PublicProfileRelationshipsPageProps = {
  model: PublicProfilePageModel;
  relationship: ProfileRelationshipKind;
  returnTo?: string;
  viewer?: AuthenticatedViewer | null;
  viewerProfileSlug?: string | null;
};

export const PublicProfileRelationshipsPage = ({
  model,
  relationship,
  returnTo = "/",
  viewer = null,
  viewerProfileSlug = null,
}: PublicProfileRelationshipsPageProps) => {
  if (model.status !== "success") {
    return (
      <PublicProfilePage
        model={model}
        returnTo={returnTo}
        viewer={viewer}
        viewerProfileSlug={viewerProfileSlug}
      />
    );
  }

  const isFollowers = relationship === "followers";
  const members = isFollowers
    ? model.relationships.followers
    : model.relationships.following;
  const title = isFollowers ? "Followers" : "Following";
  const description = isFollowers
    ? `People who follow ${model.profile.displayName} and can be explored from this public profile.`
    : `People ${model.profile.displayName} follows across the public profile network.`;

  return (
    <PublicSiteShell
      returnTo={returnTo}
      viewer={viewer}
      viewerProfileSlug={viewerProfileSlug}
    >
      <main className={styles.page}>
        <section className={styles.hero}>
          <Link className={styles.backLink} href={`/profiles/${model.profile.slug}`}>
            ← Back to {model.profile.displayName}
          </Link>

          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Relationships</p>
            <h1 className={styles.title}>
              {model.profile.displayName} {title.toLowerCase()}
            </h1>
            <p className={styles.description}>{description}</p>
          </div>

          <div className={styles.tabRow}>
            <Link
              aria-current={isFollowers ? "page" : undefined}
              className={`${styles.tabLink} ${
                isFollowers ? styles.tabLinkActive : ""
              }`}
              href={`/profiles/${model.profile.slug}/followers`}
            >
              {model.profile.followerCount} followers
            </Link>
            <Link
              aria-current={isFollowers ? undefined : "page"}
              className={`${styles.tabLink} ${
                isFollowers ? "" : styles.tabLinkActive
              }`}
              href={`/profiles/${model.profile.slug}/following`}
            >
              {model.profile.followingCount} following
            </Link>
          </div>
        </section>

        <section className={styles.listSection}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>{title}</p>
              <h2 className={styles.sectionTitle}>
                {members.length} {title.toLowerCase()}
              </h2>
            </div>
            <wa-badge appearance="outlined" pill>
              Public profiles
            </wa-badge>
          </div>

          {members.length > 0 ? (
            <ul className={styles.memberList}>
              {members.map((member) => {
                const memberCard = (
                  <>
                    <div className={styles.memberAvatar} aria-hidden="true">
                      {toInitials(member.displayName)}
                    </div>
                    <div className={styles.memberContent}>
                      <div className={styles.memberHeader}>
                        <p className={styles.memberName}>{member.displayName}</p>
                        <p className={styles.memberMeta}>
                          {toRelationshipMeta(member.profileType, member.role)}
                        </p>
                      </div>
                      <p className={styles.memberBio}>
                        {member.bio ?? "Public profile details are limited for this account."}
                      </p>
                    </div>
                  </>
                );

                return (
                  <li key={`${member.profileSlug ?? "member"}-${member.displayName}`}>
                    {member.profileSlug ? (
                      <Link
                        className={styles.memberCard}
                        href={`/profiles/${member.profileSlug}`}
                      >
                        {memberCard}
                      </Link>
                    ) : (
                      <div className={styles.memberCard}>{memberCard}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.emptyState}>No public {title.toLowerCase()} yet.</p>
          )}
        </section>
      </main>
    </PublicSiteShell>
  );
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

const toRelationshipMeta = (
  profileType: string | null,
  role: string,
): string =>
  profileType
    ? `${toTitleCase(profileType)} profile · ${toTitleCase(role)}`
    : toTitleCase(role);
