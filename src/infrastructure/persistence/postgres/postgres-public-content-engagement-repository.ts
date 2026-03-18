import { randomUUID } from "node:crypto";

import type {
  CommunityDiscussionSnapshot,
  DonationTargetLookup,
  DonationWriteRepository,
  DiscussionTargetLookup,
  DiscussionWriteRepository,
  FollowOwnerLookup,
  FollowTargetLookup,
  FollowWriteRepository,
  FollowWriteResult,
  PublicActorSnapshot,
  PublicCommunitySummarySnapshot,
  PublicContentReadRepository,
  PublicDetailLookup,
  PublicFundraiserSnapshot,
  PublicFundraiserSummarySnapshot,
  PublicProfileSnapshot,
  PublicProfileActivitySnapshot,
  ReportReviewLookup,
  ReportReviewWriteRepository,
  ReportTargetLookup,
  ReportWriteRepository,
  ReportWriteResult,
  ViewerFollowStateSnapshot,
} from "@/application";
import {
  createComment,
  createCommunity,
  createDonation,
  createFollow,
  createFundraiser,
  createPost,
  createReport,
  createUser,
  createUserProfile,
  type CommentStatus,
  type FollowTargetType,
  type ModerationStatus,
  type PostStatus,
  type ReportStatus,
  type ReportTargetType,
  type User,
} from "@/domain";

import { createPersistenceBootstrapper } from "./bootstrap";
import { createPostgresPool } from "./create-postgres-pool";
import type { SqlClient } from "./sql-client";

type Dependencies = {
  sqlClient?: SqlClient;
};

export const createPostgresPublicContentEngagementRepository = (
  dependencies: Dependencies = {},
): PublicContentReadRepository &
  DonationTargetLookup &
  DonationWriteRepository &
  DiscussionTargetLookup &
  DiscussionWriteRepository &
  ReportReviewLookup &
  ReportReviewWriteRepository &
  ReportTargetLookup &
  ReportWriteRepository &
  FollowTargetLookup &
  FollowOwnerLookup &
  FollowWriteRepository => {
  const sqlClient = dependencies.sqlClient ?? createPostgresPool();
  const bootstrapper = createPersistenceBootstrapper(sqlClient);

  const query = async <TRow extends Record<string, unknown>>(
    text: string,
    values: unknown[] = [],
  ) => {
    await bootstrapper.ensureReady();
    return sqlClient.query<TRow>(text, values);
  };

  const findUserById = async (userId: string): Promise<User | null> => {
    const result = await query<UserRow>(
      `SELECT id, email, display_name, role, created_at AS user_created_at
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [userId],
    );
    const row = result.rows[0];

    return row ? mapUser(row) : null;
  };

  const findCommunityById = async (communityId: string) => {
    const result = await query<CommunityRow>(
      `SELECT id, owner_user_id, slug, name, description, visibility, created_at
       FROM communities
       WHERE id = $1
       LIMIT 1`,
      [communityId],
    );
    const row = result.rows[0];

    return row ? mapCommunity(row) : null;
  };

  const findUserProfileByUserId = async (userId: string) => {
    const result = await query<UserProfileRow>(
      `SELECT id, user_id, slug, bio, avatar_url, profile_type, created_at
       FROM user_profiles
       WHERE user_id = $1
       LIMIT 1`,
      [userId],
    );
    const row = result.rows[0];

    return row ? mapUserProfile(row) : null;
  };

  const buildActorSnapshotByUserId = async (
    userId: string,
  ): Promise<PublicActorSnapshot | null> => {
    const user = await findUserById(userId);

    if (!user) {
      return null;
    }

    return {
      user,
      profile: await findUserProfileByUserId(userId),
    };
  };

  const findFundraiserRowsByOwnerUserId = async (ownerUserId: string) => {
    const result = await query<FundraiserRow>(
      `SELECT
         id,
         owner_user_id,
         community_id,
         slug,
         title,
         story,
         status,
         goal_amount,
         created_at
       FROM fundraisers
       WHERE owner_user_id = $1
       ORDER BY created_at DESC`,
      [ownerUserId],
    );

    return result.rows;
  };

  const findAllFundraiserRowsWithOwners = async () => {
    const result = await query<FundraiserWithOwnerRow>(
      `SELECT
         f.id,
         f.owner_user_id,
         f.community_id,
         f.slug,
         f.title,
         f.story,
         f.status,
         f.goal_amount,
         f.created_at,
         u.id AS joined_user_id,
         u.email,
         u.display_name,
         u.role,
         u.created_at AS user_created_at
       FROM fundraisers f
       INNER JOIN users u ON u.id = f.owner_user_id
       ORDER BY f.created_at DESC`,
    );

    return result.rows;
  };

  const findFundraiserRowsWithOwnersByCommunityId = async (communityId: string) => {
    const result = await query<FundraiserWithOwnerRow>(
      `SELECT
         f.id,
         f.owner_user_id,
         f.community_id,
         f.slug,
         f.title,
         f.story,
         f.status,
         f.goal_amount,
         f.created_at,
         u.id AS joined_user_id,
         u.email,
         u.display_name,
         u.role,
         u.created_at AS user_created_at
       FROM fundraisers f
       INNER JOIN users u ON u.id = f.owner_user_id
       WHERE f.community_id = $1
       ORDER BY f.created_at DESC`,
      [communityId],
    );

    return result.rows;
  };

  const findCommunityRowsByOwnerUserId = async (ownerUserId: string) => {
    const result = await query<CommunityRow>(
      `SELECT id, owner_user_id, slug, name, description, visibility, created_at
       FROM communities
       WHERE owner_user_id = $1
       ORDER BY created_at DESC`,
      [ownerUserId],
    );

    return result.rows;
  };

  const findAllCommunityRowsWithOwners = async () => {
    const result = await query<CommunityWithOwnerRow>(
      `SELECT
         c.id,
         c.owner_user_id,
         c.slug,
         c.name,
         c.description,
         c.visibility,
         c.created_at,
         u.id AS joined_user_id,
         u.email,
         u.display_name,
         u.role,
         u.created_at AS user_created_at
       FROM communities c
       INNER JOIN users u ON u.id = c.owner_user_id
       ORDER BY c.created_at DESC`,
    );

    return result.rows;
  };

  const findDonationRowsByFundraiserId = async (fundraiserId: string) => {
    const result = await query<DonationRow>(
      `SELECT id, user_id, fundraiser_id, amount, status, created_at
       FROM donations
       WHERE fundraiser_id = $1
       ORDER BY created_at DESC`,
      [fundraiserId],
    );

    return result.rows;
  };

  const countFollowersByTarget = async (
    targetType: "profile" | "community" | "fundraiser",
    targetId: string,
  ) => {
    const result = await query<{ follower_count: string }>(
      `SELECT COUNT(*)::text AS follower_count
       FROM follows
       WHERE target_type = $1 AND target_id = $2`,
      [targetType, targetId],
    );

    return Number(result.rows[0]?.follower_count ?? "0");
  };

  const buildViewerFollowState = async (
    viewerUserId: string | null | undefined,
    input: {
      ownerUserId: string;
      targetType: FollowTargetType;
      targetId: string;
    },
  ): Promise<ViewerFollowStateSnapshot | null> => {
    if (!viewerUserId) {
      return null;
    }

    if (viewerUserId === input.ownerUserId) {
      return {
        isFollowing: false,
        isOwnTarget: true,
      };
    }

    const result = await query<{ is_following: boolean }>(
      `SELECT EXISTS(
         SELECT 1
         FROM follows
         WHERE user_id = $1
           AND target_type = $2
           AND target_id = $3
       ) AS is_following`,
      [viewerUserId, input.targetType, input.targetId],
    );

    return {
      isFollowing: result.rows[0]?.is_following ?? false,
      isOwnTarget: false,
    };
  };

  const findProfileFollowers = async (
    profileId: string,
  ): Promise<PublicActorSnapshot[]> => {
    const result = await query<{ user_id: string }>(
      `SELECT user_id
       FROM follows
       WHERE target_type = 'profile'
         AND target_id = $1
       ORDER BY created_at DESC`,
      [profileId],
    );

    return (
      await Promise.all(
        result.rows.map(async (row) => buildActorSnapshotByUserId(row.user_id)),
      )
    ).filter((actor): actor is PublicActorSnapshot => actor !== null);
  };

  const findProfilesFollowedByUserId = async (
    userId: string,
  ): Promise<PublicActorSnapshot[]> => {
    const result = await query<{
      followed_user_id: string;
    }>(
      `SELECT
         p.user_id AS followed_user_id
       FROM follows f
       INNER JOIN user_profiles p ON p.id = f.target_id
       WHERE f.user_id = $1
         AND f.target_type = 'profile'
       ORDER BY f.created_at DESC`,
      [userId],
    );

    return (
      await Promise.all(
        result.rows.map(async (row) => buildActorSnapshotByUserId(row.followed_user_id)),
      )
    ).filter((actor): actor is PublicActorSnapshot => actor !== null);
  };

  const buildFundraiserSummarySnapshotFromRow = async (
    fundraiserRow: FundraiserRow,
    owner: User,
    ownerProfile: PublicActorSnapshot["profile"],
  ): Promise<PublicFundraiserSummarySnapshot> => {
    const donationMetricsResult = await query<{
      donation_count: string;
      supporter_count: string;
      amount_raised: string;
    }>(
      `SELECT
         COUNT(*)::text AS donation_count,
         COUNT(DISTINCT user_id)::text AS supporter_count,
         COALESCE(SUM(amount), 0)::text AS amount_raised
       FROM donations
      WHERE fundraiser_id = $1`,
      [fundraiserRow.id],
    );
    const relatedCommunity = fundraiserRow.community_id
      ? await findCommunityById(fundraiserRow.community_id)
      : null;

    return {
      fundraiser: mapFundraiser(fundraiserRow),
      owner,
      ownerProfile,
      relatedCommunity,
      donationCount: Number(
        donationMetricsResult.rows[0]?.donation_count ?? "0",
      ),
      supporterCount: Number(donationMetricsResult.rows[0]?.supporter_count ?? "0"),
      amountRaised: Number(donationMetricsResult.rows[0]?.amount_raised ?? "0"),
    };
  };

  const findFundraiserSummariesByOwnerUserId = async (ownerUserId: string) => {
    const owner = await findUserById(ownerUserId);

    if (!owner) {
      return [];
    }

    const ownerProfile = await findUserProfileByUserId(ownerUserId);
    const fundraiserRows = await findFundraiserRowsByOwnerUserId(ownerUserId);

    const summaries = await Promise.all(
      fundraiserRows.map((fundraiserRow) =>
        buildFundraiserSummarySnapshotFromRow(fundraiserRow, owner, ownerProfile),
      ),
    );

    return summaries.sort(compareFundraiserSummaries);
  };

  const buildCommunitySummarySnapshotFromRow = async (
    communityRow: CommunityWithOwnerRow,
  ): Promise<PublicCommunitySummarySnapshot> => ({
    community: mapCommunity(communityRow),
    owner: mapJoinedUser(communityRow),
    ownerProfile: await findUserProfileByUserId(communityRow.owner_user_id),
    followerCount: await countFollowersByTarget("community", communityRow.id),
    fundraiserCount: (await findFundraiserRowsWithOwnersByCommunityId(communityRow.id))
      .length,
  });

  const findVisibleDiscussionForCommunityId = async (
    communityId: string,
  ): Promise<CommunityDiscussionSnapshot[]> => {
    const postsResult = await query<PostWithAuthorRow>(
      `SELECT
         p.id,
         p.community_id,
         p.author_user_id,
         p.title,
         p.body,
         p.status,
         p.moderation_status,
         p.created_at,
         u.id AS joined_user_id,
         u.email,
         u.display_name,
         u.role,
         u.created_at AS user_created_at
       FROM posts p
       INNER JOIN users u ON u.id = p.author_user_id
       WHERE p.community_id = $1
         AND p.status = 'published'
         AND p.moderation_status = 'visible'
       ORDER BY p.created_at DESC`,
      [communityId],
    );

    return Promise.all(
      postsResult.rows.map(async (postRow) => {
        const commentsResult = await query<CommentWithAuthorRow>(
          `SELECT
             c.id,
             c.post_id,
             c.author_user_id,
             c.body,
             c.status,
             c.moderation_status,
             c.created_at,
             u.id AS joined_user_id,
             u.email,
             u.display_name,
             u.role,
             u.created_at AS user_created_at
           FROM comments c
           INNER JOIN users u ON u.id = c.author_user_id
           WHERE c.post_id = $1
             AND c.moderation_status = 'visible'
           ORDER BY c.created_at ASC`,
          [postRow.id],
        );

        return {
          post: mapPost(postRow),
          author: mapJoinedUser(postRow),
          authorProfile: await findUserProfileByUserId(postRow.author_user_id),
          comments: await Promise.all(
            commentsResult.rows.map(async (commentRow) => ({
              comment: mapComment(commentRow),
              author: mapJoinedUser(commentRow),
              authorProfile: await findUserProfileByUserId(commentRow.author_user_id),
            })),
          ),
        };
      }),
    );
  };

  const buildProfileRecentActivity = async (
    fundraiserSummaries: PublicFundraiserSummarySnapshot[],
    ownedCommunities: ReturnType<typeof mapCommunity>[],
  ): Promise<PublicProfileActivitySnapshot[]> => {
    const donationActivity = (
      await Promise.all(
        fundraiserSummaries.map(async (fundraiserSummary) => {
          const donationRows = await findDonationRowsByFundraiserId(
            fundraiserSummary.fundraiser.id,
          );

          return Promise.all(
            donationRows.map(async (donationRow) => {
              const actor = await buildActorSnapshotByUserId(
                donationRow.user_id,
              );

              return actor
                ? {
                    type: "fundraiser_donation" as const,
                    actor,
                    fundraiser: fundraiserSummary,
                    community: fundraiserSummary.relatedCommunity,
                    donation: mapDonation(donationRow),
                  }
                : null;
            }),
          );
        }),
      )
    )
      .flat()
      .filter(
        (
          entry,
        ): entry is Extract<
          PublicProfileActivitySnapshot,
          { type: "fundraiser_donation" }
        > => entry !== null,
      );

    const communityPostActivity = (
      await Promise.all(
        ownedCommunities.map(async (community) => {
          const discussion = await findVisibleDiscussionForCommunityId(community.id);

          return Promise.all(
            discussion.map(async (entry) => {
              const actor = await buildActorSnapshotByUserId(entry.author.id);

              return actor
                ? {
                    type: "community_post" as const,
                    actor,
                    community,
                    post: entry.post,
                  }
                : null;
            }),
          );
        }),
      )
    )
      .flat()
      .filter(
        (
          entry,
        ): entry is Extract<
          PublicProfileActivitySnapshot,
          { type: "community_post" }
        > => entry !== null,
      );

    return [...donationActivity, ...communityPostActivity]
      .sort((left, right) => {
        const leftCreatedAt =
          left.type === "fundraiser_donation"
            ? left.donation.createdAt
            : left.post.createdAt;
        const rightCreatedAt =
          right.type === "fundraiser_donation"
            ? right.donation.createdAt
            : right.post.createdAt;

        return rightCreatedAt.getTime() - leftCreatedAt.getTime();
      })
      .slice(0, 8);
  };

  const countInspiredSupporters = async (
    ownerUserId: string,
    fundraiserSummaries: PublicFundraiserSummarySnapshot[],
    ownedCommunities: ReturnType<typeof mapCommunity>[],
  ) => {
    const engagedUserIds = new Set<string>();

    for (const fundraiserSummary of fundraiserSummaries) {
      const donationRows = await findDonationRowsByFundraiserId(
        fundraiserSummary.fundraiser.id,
      );

      donationRows.forEach((donationRow) => {
        if (donationRow.user_id !== ownerUserId) {
          engagedUserIds.add(donationRow.user_id);
        }
      });
    }

    for (const community of ownedCommunities) {
      const discussion = await findVisibleDiscussionForCommunityId(community.id);

      discussion.forEach((entry) => {
        if (entry.author.id !== ownerUserId) {
          engagedUserIds.add(entry.author.id);
        }

        entry.comments.forEach((commentEntry) => {
          if (commentEntry.author.id !== ownerUserId) {
            engagedUserIds.add(commentEntry.author.id);
          }
        });
      });
    }

    return engagedUserIds.size;
  };

  const findFundraiserReferenceBySlug = async (slug: string) => {
    const result = await query<{
      id: string;
      slug: string;
    }>(
      `SELECT id, slug
       FROM fundraisers
       WHERE slug = $1
       LIMIT 1`,
      [slug],
    );
    const fundraiser = result.rows[0];

    return fundraiser
      ? {
          id: fundraiser.id,
          slug: fundraiser.slug,
        }
      : null;
  };

  const persistDonation = async (input: {
    userId: string;
    fundraiserId: string;
    amount: number;
  }) => {
    const donationId = `donation_${randomUUID()}`;
    const now = new Date();
    const result = await query<DonationRow>(
      `INSERT INTO donations
         (id, user_id, fundraiser_id, amount, status, created_at)
       VALUES
         ($1, $2, $3, $4, 'completed', $5)
       RETURNING id, user_id, fundraiser_id, amount, status, created_at`,
      [donationId, input.userId, input.fundraiserId, input.amount, now],
    );
    const row = result.rows[0];

    if (!row) {
      throw new Error(
        "Expected the created donation row to be returned after insert.",
      );
    }

    return mapDonation(row);
  };

  return {
    async listFundraisers() {
      const fundraiserRows = await findAllFundraiserRowsWithOwners();

      return Promise.all(
        fundraiserRows.map(async (fundraiserRow) => {
          const owner = mapJoinedUser(fundraiserRow);

          return buildFundraiserSummarySnapshotFromRow(
            fundraiserRow,
            owner,
            await findUserProfileByUserId(fundraiserRow.owner_user_id),
          );
        }),
      );
    },

    async listCommunities() {
      const communityRows = await findAllCommunityRowsWithOwners();

      return Promise.all(
        communityRows.map((communityRow) =>
          buildCommunitySummarySnapshotFromRow(communityRow),
        ),
      );
    },

    async findProfileSlugByUserId(userId) {
      const profile = await findUserProfileByUserId(userId);

      return profile?.slug ?? null;
    },

    async findProfileBySlug(input: PublicDetailLookup) {
      const profileResult = await query<UserProfileWithUserRow>(
        `SELECT
           p.id,
           p.user_id,
           p.slug,
           p.bio,
           p.avatar_url,
           p.profile_type,
           p.created_at,
           u.id AS joined_user_id,
           u.email,
           u.display_name,
           u.role,
           u.created_at AS user_created_at
         FROM user_profiles p
         INNER JOIN users u ON u.id = p.user_id
         WHERE p.slug = $1
         LIMIT 1`,
        [input.slug],
      );

      const profileRow = profileResult.rows[0];

      if (!profileRow) {
        return null;
      }

      const user = mapJoinedUser(profileRow);
      const profile = mapUserProfile(profileRow);
      const ownedCommunities = (await findCommunityRowsByOwnerUserId(profileRow.user_id))
        .map(mapCommunity);
      const featuredFundraisers = await findFundraiserSummariesByOwnerUserId(
        profileRow.user_id,
      );
      const followers = await findProfileFollowers(profileRow.id);
      const following = await findProfilesFollowedByUserId(profileRow.user_id);

      return {
        user,
        profile,
        viewerFollowState: await buildViewerFollowState(input.viewerUserId, {
          ownerUserId: profileRow.user_id,
          targetType: "profile",
          targetId: profileRow.id,
        }),
        followerCount: followers.length,
        followingCount: following.length,
        inspiredSupporterCount: await countInspiredSupporters(
          profileRow.user_id,
          featuredFundraisers,
          ownedCommunities,
        ),
        followers,
        following,
        featuredFundraisers,
        ownedCommunities,
        recentActivity: await buildProfileRecentActivity(
          featuredFundraisers,
          ownedCommunities,
        ),
      } satisfies PublicProfileSnapshot;
    },

    async findFundraiserBySlug(input: PublicDetailLookup) {
      const fundraiserResult = await query<FundraiserWithOwnerRow>(
        `SELECT
           f.id,
           f.owner_user_id,
           f.community_id,
           f.slug,
           f.title,
           f.story,
           f.status,
           f.goal_amount,
           f.created_at,
           u.id AS joined_user_id,
           u.email,
           u.display_name,
           u.role,
           u.created_at AS user_created_at
         FROM fundraisers f
         INNER JOIN users u ON u.id = f.owner_user_id
         WHERE f.slug = $1
         LIMIT 1`,
        [input.slug],
      );

      const fundraiserRow = fundraiserResult.rows[0];

      if (!fundraiserRow) {
        return null;
      }
      const owner = mapJoinedUser(fundraiserRow);
      const ownerProfile = await findUserProfileByUserId(fundraiserRow.owner_user_id);
      const donationRows = await findDonationRowsByFundraiserId(
        fundraiserRow.id,
      );

      return {
        summary: await buildFundraiserSummarySnapshotFromRow(
          fundraiserRow,
          owner,
          ownerProfile,
        ),
        viewerFollowState: await buildViewerFollowState(input.viewerUserId, {
          ownerUserId: fundraiserRow.owner_user_id,
          targetType: "fundraiser",
          targetId: fundraiserRow.id,
        }),
        recentDonations: (
          await Promise.all(
            donationRows.map(async (donationRow) => {
              const actor = await buildActorSnapshotByUserId(
                donationRow.user_id,
              );

              return actor
                ? {
                    actor,
                    donation: mapDonation(donationRow),
                  }
                : null;
            }),
          )
        ).filter((entry): entry is PublicFundraiserSnapshot["recentDonations"][number] => entry !== null),
      } satisfies PublicFundraiserSnapshot;
    },

    async findCommunityBySlug(input: PublicDetailLookup) {
      const communityResult = await query<CommunityWithOwnerRow>(
        `SELECT
           c.id,
           c.owner_user_id,
           c.slug,
           c.name,
           c.description,
           c.visibility,
           c.created_at,
           u.id AS joined_user_id,
           u.email,
           u.display_name,
           u.role,
           u.created_at AS user_created_at
         FROM communities c
         INNER JOIN users u ON u.id = c.owner_user_id
         WHERE c.slug = $1
         LIMIT 1`,
        [input.slug],
      );

      const communityRow = communityResult.rows[0];

      if (!communityRow) {
        return null;
      }
      const fundraisers = await Promise.all(
        (
          await findFundraiserRowsWithOwnersByCommunityId(communityRow.id)
        ).map(async (fundraiserRow) =>
          buildFundraiserSummarySnapshotFromRow(
            fundraiserRow,
            mapJoinedUser(fundraiserRow),
            await findUserProfileByUserId(fundraiserRow.owner_user_id),
          ),
        ),
      );
      fundraisers.sort(compareFundraiserSummaries);

      return {
        community: mapCommunity(communityRow),
        owner: mapJoinedUser(communityRow),
        ownerProfile: await findUserProfileByUserId(communityRow.owner_user_id),
        viewerFollowState: await buildViewerFollowState(input.viewerUserId, {
          ownerUserId: communityRow.owner_user_id,
          targetType: "community",
          targetId: communityRow.id,
        }),
        featuredFundraiser: fundraisers[0] ?? null,
        fundraisers,
        followerCount: await countFollowersByTarget("community", communityRow.id),
        amountRaised: fundraisers.reduce(
          (sum, fundraiserSummary) => sum + fundraiserSummary.amountRaised,
          0,
        ),
        donationCount: fundraisers.reduce(
          (sum, fundraiserSummary) => sum + fundraiserSummary.donationCount,
          0,
        ),
        discussion: await findVisibleDiscussionForCommunityId(communityRow.id),
      };
    },

    async findCommunityBySlugForPostCreation(slug) {
      const result = await query<{
        id: string;
        slug: string;
        owner_user_id: string;
      }>(
        `SELECT id, slug, owner_user_id
         FROM communities
         WHERE slug = $1
         LIMIT 1`,
        [slug],
      );
      const community = result.rows[0];

      return community
        ? {
            id: community.id,
            slug: community.slug,
            ownerUserId: community.owner_user_id,
          }
        : null;
    },

    async findFundraiserBySlugForDonation(slug) {
      return findFundraiserReferenceBySlug(slug);
    },

    async findPostByIdForCommentCreation(postId) {
      const result = await query<{ id: string }>(
        `SELECT id
         FROM posts
         WHERE id = $1
           AND status = 'published'
           AND moderation_status = 'visible'
         LIMIT 1`,
        [postId],
      );
      const post = result.rows[0];

      return post
        ? {
            id: post.id,
          }
        : null;
    },

    async findReportTargetById(targetType, targetId) {
      switch (targetType) {
        case "post": {
          const result = await query<{ id: string }>(
            "SELECT id FROM posts WHERE id = $1 LIMIT 1",
            [targetId],
          );
          const target = result.rows[0];

          return target
            ? {
                id: target.id,
                targetType,
              }
            : null;
        }

        case "comment": {
          const result = await query<{ id: string }>(
            "SELECT id FROM comments WHERE id = $1 LIMIT 1",
            [targetId],
          );
          const target = result.rows[0];

          return target
            ? {
                id: target.id,
                targetType,
              }
            : null;
        }
      }
    },

    async findReportById(reportId) {
      const result = await query<ReportRow>(
        `SELECT id, reporter_user_id, target_type, target_id, reason, status, created_at
         FROM reports
         WHERE id = $1
         LIMIT 1`,
        [reportId],
      );
      const report = result.rows[0];

      return report ? mapReport(report) : null;
    },

    async findReportModerationContext(targetType, targetId) {
      switch (targetType) {
        case "post": {
          const result = await query<{
            id: string;
            owner_user_id: string;
            moderation_status: ModerationStatus;
          }>(
            `SELECT p.id, c.owner_user_id, p.moderation_status
             FROM posts p
             INNER JOIN communities c ON c.id = p.community_id
             WHERE p.id = $1
             LIMIT 1`,
            [targetId],
          );
          const context = result.rows[0];

          return context
            ? {
                targetType,
                targetId: context.id,
                ownerUserId: context.owner_user_id,
                moderationStatus: context.moderation_status,
              }
            : null;
        }

        case "comment": {
          const result = await query<{
            id: string;
            owner_user_id: string;
            moderation_status: ModerationStatus;
          }>(
            `SELECT c.id, co.owner_user_id, c.moderation_status
             FROM comments c
             INNER JOIN posts p ON p.id = c.post_id
             INNER JOIN communities co ON co.id = p.community_id
             WHERE c.id = $1
             LIMIT 1`,
            [targetId],
          );
          const context = result.rows[0];

          return context
            ? {
                targetType,
                targetId: context.id,
                ownerUserId: context.owner_user_id,
                moderationStatus: context.moderation_status,
              }
            : null;
        }
      }
    },

    async findTargetBySlug(targetType, slug) {
      switch (targetType) {
        case "profile": {
          const result = await query<IdAndSlugRow>(
            "SELECT id, slug FROM user_profiles WHERE slug = $1 LIMIT 1",
            [slug],
          );

          return result.rows[0]
            ? {
                id: result.rows[0].id,
                slug: result.rows[0].slug,
                targetType,
              }
            : null;
        }

        case "fundraiser": {
          const result = await query<IdAndSlugRow>(
            "SELECT id, slug FROM fundraisers WHERE slug = $1 LIMIT 1",
            [slug],
          );

          return result.rows[0]
            ? {
                id: result.rows[0].id,
                slug: result.rows[0].slug,
                targetType,
              }
            : null;
        }

        case "community": {
          const result = await query<IdAndSlugRow>(
            "SELECT id, slug FROM communities WHERE slug = $1 LIMIT 1",
            [slug],
          );

          return result.rows[0]
            ? {
                id: result.rows[0].id,
                slug: result.rows[0].slug,
                targetType,
              }
            : null;
        }
      }
    },

    async findOwnerUserIdByTarget(targetType, targetId) {
      switch (targetType) {
        case "profile": {
          const result = await query<{ user_id: string }>(
            "SELECT user_id FROM user_profiles WHERE id = $1 LIMIT 1",
            [targetId],
          );

          return result.rows[0]?.user_id ?? null;
        }

        case "fundraiser": {
          const result = await query<{ owner_user_id: string }>(
            "SELECT owner_user_id FROM fundraisers WHERE id = $1 LIMIT 1",
            [targetId],
          );

          return result.rows[0]?.owner_user_id ?? null;
        }

        case "community": {
          const result = await query<{ owner_user_id: string }>(
            "SELECT owner_user_id FROM communities WHERE id = $1 LIMIT 1",
            [targetId],
          );

          return result.rows[0]?.owner_user_id ?? null;
        }
      }
    },

    async createFollowIfAbsent(input) {
      const existingResult = await query<FollowRow>(
        `SELECT id, user_id, target_type, target_id, created_at
         FROM follows
         WHERE user_id = $1 AND target_type = $2 AND target_id = $3
         LIMIT 1`,
        [input.userId, input.targetType, input.targetId],
      );
      const existingRow = existingResult.rows[0];

      if (existingRow) {
        return {
          follow: mapFollow(existingRow),
          created: false,
        } satisfies FollowWriteResult;
      }

      const now = new Date();
      const followId = `follow_${randomUUID()}`;
      const insertResult = await query<FollowRow>(
        `INSERT INTO follows (id, user_id, target_type, target_id, created_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id, target_type, target_id, created_at`,
        [followId, input.userId, input.targetType, input.targetId, now],
      );

      const insertedRow = insertResult.rows[0];
      if (!insertedRow) {
        throw new Error(
          "Expected the created follow row to be returned after insert.",
        );
      }

      return {
        follow: mapFollow(insertedRow),
        created: true,
      } satisfies FollowWriteResult;
    },

    async createPost(input) {
      const postId = `post_${randomUUID()}`;
      const now = new Date();
      const result = await query<PostRow>(
        `INSERT INTO posts
           (id, community_id, author_user_id, title, body, status, moderation_status, created_at)
         VALUES
           ($1, $2, $3, $4, $5, 'published', 'visible', $6)
         RETURNING id, community_id, author_user_id, title, body, status, moderation_status, created_at`,
        [postId, input.communityId, input.authorUserId, input.title, input.body, now],
      );
      const row = result.rows[0];

      if (!row) {
        throw new Error(
          "Expected the created post row to be returned after insert.",
        );
      }

      return mapPost(row);
    },

    async createComment(input) {
      const commentId = `comment_${randomUUID()}`;
      const now = new Date();
      const result = await query<CommentRow>(
        `INSERT INTO comments
           (id, post_id, author_user_id, body, status, moderation_status, created_at)
         VALUES
           ($1, $2, $3, $4, 'published', 'visible', $5)
         RETURNING id, post_id, author_user_id, body, status, moderation_status, created_at`,
        [commentId, input.postId, input.authorUserId, input.body, now],
      );
      const row = result.rows[0];

      if (!row) {
        throw new Error(
          "Expected the created comment row to be returned after insert.",
        );
      }

      return mapComment(row);
    },

    async createDonation(input) {
      return persistDonation(input);
    },

    async createReportIfAbsent(input) {
      const existingResult = await query<ReportRow>(
        `SELECT id, reporter_user_id, target_type, target_id, reason, status, created_at
         FROM reports
         WHERE reporter_user_id = $1
           AND target_type = $2
           AND target_id = $3
         ORDER BY created_at DESC
         LIMIT 1`,
        [input.reporterUserId, input.targetType, input.targetId],
      );
      const existingRow = existingResult.rows[0];

      if (existingRow) {
        return {
          report: mapReport(existingRow),
          created: false,
        } satisfies ReportWriteResult;
      }

      const reportId = `report_${randomUUID()}`;
      const now = new Date();
      const insertResult = await query<ReportRow>(
        `INSERT INTO reports
           (id, reporter_user_id, target_type, target_id, reason, status, created_at)
         VALUES
           ($1, $2, $3, $4, $5, 'submitted', $6)
         RETURNING id, reporter_user_id, target_type, target_id, reason, status, created_at`,
        [
          reportId,
          input.reporterUserId,
          input.targetType,
          input.targetId,
          input.reason,
          now,
        ],
      );
      const insertedRow = insertResult.rows[0];

      if (!insertedRow) {
        throw new Error(
          "Expected the created report row to be returned after insert.",
        );
      }

      return {
        report: mapReport(insertedRow),
        created: true,
      } satisfies ReportWriteResult;
    },

    async setModerationStatus(input) {
      switch (input.targetType) {
        case "post":
          await query(
            `UPDATE posts
             SET moderation_status = $2
             WHERE id = $1`,
            [input.targetId, input.moderationStatus],
          );
          return;
        case "comment":
          await query(
            `UPDATE comments
             SET moderation_status = $2
             WHERE id = $1`,
            [input.targetId, input.moderationStatus],
          );
          return;
      }
    },

    async setReportStatus(input) {
      await query(
        `UPDATE reports
         SET status = $2
         WHERE id = $1`,
        [input.reportId, input.status],
      );
    },

    async removeFollowIfPresent(input) {
      const deletionResult = await query<{ id: string }>(
        `DELETE FROM follows
         WHERE user_id = $1 AND target_type = $2 AND target_id = $3
         RETURNING id`,
        [input.userId, input.targetType, input.targetId],
      );

      return {
        removed: deletionResult.rows.length > 0,
      };
    },

    async countFollowersForTarget(input) {
      const countResult = await query<{ follower_count: string }>(
        `SELECT COUNT(*)::text AS follower_count
         FROM follows
         WHERE target_type = $1 AND target_id = $2`,
        [input.targetType, input.targetId],
      );

      return Number(countResult.rows[0]?.follower_count ?? "0");
    },
  };
};

type UserRow = {
  id: string;
  email: string;
  display_name: string;
  role: User["role"];
  user_created_at: Date | string;
};

type UserProfileRow = {
  id: string;
  user_id: string;
  slug: string;
  bio: string;
  avatar_url: string | null;
  profile_type: "supporter" | "organizer";
  created_at: Date | string;
};

type FundraiserRow = {
  id: string;
  owner_user_id: string;
  community_id: string | null;
  slug: string;
  title: string;
  story: string;
  status: "draft" | "active" | "closed";
  goal_amount: number | string;
  created_at: Date | string;
};

type CommunityRow = {
  id: string;
  owner_user_id: string;
  slug: string;
  name: string;
  description: string;
  visibility: "public" | "members_only" | "private";
  created_at: Date | string;
};

type PostRow = {
  id: string;
  community_id: string;
  author_user_id: string;
  title: string;
  body: string;
  status: PostStatus;
  moderation_status: ModerationStatus;
  created_at: Date | string;
};

type CommentRow = {
  id: string;
  post_id: string;
  author_user_id: string;
  body: string;
  status: CommentStatus;
  moderation_status: ModerationStatus;
  created_at: Date | string;
};

type FollowRow = {
  id: string;
  user_id: string;
  target_type: FollowTargetType;
  target_id: string;
  created_at: Date | string;
};

type DonationRow = {
  id: string;
  user_id: string;
  fundraiser_id: string;
  amount: number | string;
  status: "completed";
  created_at: Date | string;
};

type ReportRow = {
  id: string;
  reporter_user_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  status: ReportStatus;
  created_at: Date | string;
};

type JoinedUserRow = {
  joined_user_id: string;
  email: string;
  display_name: string;
  role: User["role"];
  user_created_at: Date | string;
};

type UserProfileWithUserRow = UserProfileRow &
  JoinedUserRow & { created_at: Date | string };
type FundraiserWithOwnerRow = FundraiserRow & JoinedUserRow;
type CommunityWithOwnerRow = CommunityRow & JoinedUserRow;
type PostWithAuthorRow = PostRow & JoinedUserRow;
type CommentWithAuthorRow = CommentRow & JoinedUserRow;
type IdAndSlugRow = {
  id: string;
  slug: string;
};

const compareFundraiserSummaries = (
  left: PublicFundraiserSummarySnapshot,
  right: PublicFundraiserSummarySnapshot,
): number => {
  if (right.amountRaised !== left.amountRaised) {
    return right.amountRaised - left.amountRaised;
  }

  if (right.donationCount !== left.donationCount) {
    return right.donationCount - left.donationCount;
  }

  return (
    right.fundraiser.createdAt.getTime() - left.fundraiser.createdAt.getTime()
  );
};

const mapUser = (row: UserRow) =>
  createUser({
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    createdAt: asDate(row.user_created_at, "user_created_at"),
  });

const mapJoinedUser = (row: JoinedUserRow) =>
  createUser({
    id: row.joined_user_id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    createdAt: asDate(row.user_created_at, "user_created_at"),
  });

const mapUserProfile = (row: UserProfileRow) =>
  createUserProfile({
    id: row.id,
    userId: row.user_id,
    slug: row.slug,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    profileType: row.profile_type,
    createdAt: asDate(row.created_at, "created_at"),
  });

const mapFundraiser = (row: FundraiserRow) =>
  createFundraiser({
    id: row.id,
    ownerUserId: row.owner_user_id,
    communityId: row.community_id,
    slug: row.slug,
    title: row.title,
    story: row.story,
    status: row.status,
    goalAmount: Number(row.goal_amount),
    createdAt: asDate(row.created_at, "created_at"),
  });

const mapCommunity = (row: CommunityRow) =>
  createCommunity({
    id: row.id,
    ownerUserId: row.owner_user_id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    visibility: row.visibility,
    createdAt: asDate(row.created_at, "created_at"),
  });

const mapPost = (row: PostRow) =>
  createPost({
    id: row.id,
    communityId: row.community_id,
    authorUserId: row.author_user_id,
    title: row.title,
    body: row.body,
    status: row.status,
    moderationStatus: row.moderation_status,
    createdAt: asDate(row.created_at, "created_at"),
  });

const mapComment = (row: CommentRow) =>
  createComment({
    id: row.id,
    postId: row.post_id,
    authorUserId: row.author_user_id,
    body: row.body,
    status: row.status,
    moderationStatus: row.moderation_status,
    createdAt: asDate(row.created_at, "created_at"),
  });

const mapFollow = (row: FollowRow) =>
  createFollow({
    id: row.id,
    userId: row.user_id,
    targetType: row.target_type,
    targetId: row.target_id,
    createdAt: asDate(row.created_at, "created_at"),
  });

const mapDonation = (row: DonationRow) =>
  createDonation({
    id: row.id,
    userId: row.user_id,
    fundraiserId: row.fundraiser_id,
    amount: Number(row.amount),
    status: row.status,
    createdAt: asDate(row.created_at, "created_at"),
  });

const mapReport = (row: ReportRow) =>
  createReport({
    id: row.id,
    reporterUserId: row.reporter_user_id,
    targetType: row.target_type,
    targetId: row.target_id,
    reason: row.reason,
    status: row.status,
    createdAt: asDate(row.created_at, "created_at"),
  });

const asDate = (value: string | Date, fieldName: string): Date => {
  if (value instanceof Date) {
    return value;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldName} must be a valid date.`);
  }

  return parsed;
};
