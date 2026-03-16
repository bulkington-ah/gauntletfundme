import {
  requireDate,
  requireNonEmptyString,
} from "@/domain/shared";

export const postStatuses = ["draft", "published", "archived"] as const;
export const moderationStatuses = ["visible", "flagged", "removed"] as const;

export type PostStatus = (typeof postStatuses)[number];
export type ModerationStatus = (typeof moderationStatuses)[number];

export type Post = {
  id: string;
  communityId: string;
  authorUserId: string;
  title: string;
  body: string;
  status: PostStatus;
  moderationStatus: ModerationStatus;
  createdAt: Date;
};

export type CreatePostInput = Post;

export const createPost = (input: CreatePostInput): Post => ({
  id: requireNonEmptyString(input.id, "id"),
  communityId: requireNonEmptyString(input.communityId, "communityId"),
  authorUserId: requireNonEmptyString(input.authorUserId, "authorUserId"),
  title: requireNonEmptyString(input.title, "title"),
  body: requireNonEmptyString(input.body, "body"),
  status: input.status,
  moderationStatus: input.moderationStatus,
  createdAt: requireDate(input.createdAt, "createdAt"),
});
