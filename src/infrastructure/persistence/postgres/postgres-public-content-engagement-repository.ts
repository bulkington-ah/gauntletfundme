import { randomUUID } from "node:crypto";

import type {
  FollowOwnerLookup,
  FollowTargetLookup,
  FollowWriteRepository,
  FollowWriteResult,
  PublicContentReadRepository,
  PublicFundraiserSnapshot,
  PublicProfileSnapshot,
} from "@/application";
import {
  createComment,
  createCommunity,
  createFollow,
  createFundraiser,
  createPost,
  createUser,
  createUserProfile,
  type CommentStatus,
  type FollowTargetType,
  type ModerationStatus,
  type PostStatus,
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

  return {
    async findProfileBySlug(slug) {
      const profileResult = await query<UserProfileWithUserRow>(
        `SELECT
           p.id,
           p.user_id,
           p.slug,
           p.bio,
           p.avatar_url,
           p.profile_type,
           p.created_at,
           u.email,
           u.display_name,
           u.role,
           u.created_at AS user_created_at
         FROM user_profiles p
         INNER JOIN users u ON u.id = p.user_id
         WHERE p.slug = $1
         LIMIT 1`,
        [slug],
      );

      const profileRow = profileResult.rows[0];

      if (!profileRow) {
        return null;
      }

      const followerCountResult = await query<{ follower_count: string }>(
        `SELECT COUNT(*)::text AS follower_count
         FROM follows
         WHERE target_type = 'profile' AND target_id = $1`,
        [profileRow.id],
      );

      const fundraisersResult = await query<FundraiserRow>(
        `SELECT id, owner_user_id, slug, title, story, status, goal_amount, created_at
         FROM fundraisers
         WHERE owner_user_id = $1
         ORDER BY created_at DESC`,
        [profileRow.user_id],
      );

      const communitiesResult = await query<CommunityRow>(
        `SELECT id, owner_user_id, slug, name, description, visibility, created_at
         FROM communities
         WHERE owner_user_id = $1
         ORDER BY created_at DESC`,
        [profileRow.user_id],
      );

      const user = mapUser(profileRow);
      const profile = mapUserProfile(profileRow);

      return {
        user,
        profile,
        followerCount: Number(followerCountResult.rows[0]?.follower_count ?? "0"),
        featuredFundraisers: fundraisersResult.rows.map(mapFundraiser),
        ownedCommunities: communitiesResult.rows.map(mapCommunity),
      } satisfies PublicProfileSnapshot;
    },

    async findFundraiserBySlug(slug) {
      const fundraiserResult = await query<FundraiserWithOwnerRow>(
        `SELECT
           f.id,
           f.owner_user_id,
           f.slug,
           f.title,
           f.story,
           f.status,
           f.goal_amount,
           f.created_at,
           u.email,
           u.display_name,
           u.role,
           u.created_at AS user_created_at
         FROM fundraisers f
         INNER JOIN users u ON u.id = f.owner_user_id
         WHERE f.slug = $1
         LIMIT 1`,
        [slug],
      );

      const fundraiserRow = fundraiserResult.rows[0];

      if (!fundraiserRow) {
        return null;
      }

      const ownerProfileResult = await query<UserProfileRow>(
        `SELECT id, user_id, slug, bio, avatar_url, profile_type, created_at
         FROM user_profiles
         WHERE user_id = $1
         LIMIT 1`,
        [fundraiserRow.owner_user_id],
      );

      const relatedCommunityResult = await query<CommunityRow>(
        `SELECT id, owner_user_id, slug, name, description, visibility, created_at
         FROM communities
         WHERE owner_user_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [fundraiserRow.owner_user_id],
      );

      const donationIntentCountResult = await query<{ intent_count: string }>(
        `SELECT COUNT(*)::text AS intent_count
         FROM donation_intents
         WHERE fundraiser_id = $1`,
        [fundraiserRow.id],
      );

      return {
        fundraiser: mapFundraiser(fundraiserRow),
        owner: mapUser(fundraiserRow),
        ownerProfile: ownerProfileResult.rows[0]
          ? mapUserProfile(ownerProfileResult.rows[0])
          : null,
        relatedCommunity: relatedCommunityResult.rows[0]
          ? mapCommunity(relatedCommunityResult.rows[0])
          : null,
        donationIntentCount: Number(
          donationIntentCountResult.rows[0]?.intent_count ?? "0",
        ),
      } satisfies PublicFundraiserSnapshot;
    },

    async findCommunityBySlug(slug) {
      const communityResult = await query<CommunityWithOwnerRow>(
        `SELECT
           c.id,
           c.owner_user_id,
           c.slug,
           c.name,
           c.description,
           c.visibility,
           c.created_at,
           u.email,
           u.display_name,
           u.role,
           u.created_at AS user_created_at
         FROM communities c
         INNER JOIN users u ON u.id = c.owner_user_id
         WHERE c.slug = $1
         LIMIT 1`,
        [slug],
      );

      const communityRow = communityResult.rows[0];

      if (!communityRow) {
        return null;
      }

      const ownerProfileResult = await query<UserProfileRow>(
        `SELECT id, user_id, slug, bio, avatar_url, profile_type, created_at
         FROM user_profiles
         WHERE user_id = $1
         LIMIT 1`,
        [communityRow.owner_user_id],
      );

      const featuredFundraiserResult = await query<FundraiserRow>(
        `SELECT id, owner_user_id, slug, title, story, status, goal_amount, created_at
         FROM fundraisers
         WHERE owner_user_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [communityRow.owner_user_id],
      );

      const followerCountResult = await query<{ follower_count: string }>(
        `SELECT COUNT(*)::text AS follower_count
         FROM follows
         WHERE target_type = 'community' AND target_id = $1`,
        [communityRow.id],
      );

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
        [communityRow.id],
      );

      const discussion = await Promise.all(
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
            author: mapUser(postRow),
            comments: commentsResult.rows.map((commentRow) => ({
              comment: mapComment(commentRow),
              author: mapUser(commentRow),
            })),
          };
        }),
      );

      return {
        community: mapCommunity(communityRow),
        owner: mapUser(communityRow),
        ownerProfile: ownerProfileResult.rows[0]
          ? mapUserProfile(ownerProfileResult.rows[0])
          : null,
        featuredFundraiser: featuredFundraiserResult.rows[0]
          ? mapFundraiser(featuredFundraiserResult.rows[0])
          : null,
        followerCount: Number(followerCountResult.rows[0]?.follower_count ?? "0"),
        discussion,
      };
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

type UserProfileWithUserRow = UserProfileRow & UserRow & { created_at: Date | string };
type FundraiserWithOwnerRow = FundraiserRow & UserRow;
type CommunityWithOwnerRow = CommunityRow & UserRow;
type PostWithAuthorRow = PostRow & UserRow;
type CommentWithAuthorRow = CommentRow & UserRow;
type IdAndSlugRow = {
  id: string;
  slug: string;
};

const mapUser = (row: UserRow) =>
  createUser({
    id: row.id,
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
