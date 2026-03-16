import {
  requireDate,
  requireNonEmptyString,
} from "@/domain/shared";

import type { ModerationStatus } from "./post";

export const commentStatuses = ["published", "edited", "archived"] as const;

export type CommentStatus = (typeof commentStatuses)[number];

export type Comment = {
  id: string;
  postId: string;
  authorUserId: string;
  body: string;
  status: CommentStatus;
  moderationStatus: ModerationStatus;
  createdAt: Date;
};

export type CreateCommentInput = Comment;

export const createComment = (input: CreateCommentInput): Comment => ({
  id: requireNonEmptyString(input.id, "id"),
  postId: requireNonEmptyString(input.postId, "postId"),
  authorUserId: requireNonEmptyString(input.authorUserId, "authorUserId"),
  body: requireNonEmptyString(input.body, "body"),
  status: input.status,
  moderationStatus: input.moderationStatus,
  createdAt: requireDate(input.createdAt, "createdAt"),
});
