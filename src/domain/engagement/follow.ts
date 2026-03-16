import {
  requireDate,
  requireNonEmptyString,
} from "@/domain/shared";

export const followTargetTypes = ["profile", "fundraiser", "community"] as const;

export type FollowTargetType = (typeof followTargetTypes)[number];

export type Follow = {
  id: string;
  userId: string;
  targetType: FollowTargetType;
  targetId: string;
  createdAt: Date;
};

export type CreateFollowInput = Follow;

export const createFollow = (input: CreateFollowInput): Follow => ({
  id: requireNonEmptyString(input.id, "id"),
  userId: requireNonEmptyString(input.userId, "userId"),
  targetType: input.targetType,
  targetId: requireNonEmptyString(input.targetId, "targetId"),
  createdAt: requireDate(input.createdAt, "createdAt"),
});
