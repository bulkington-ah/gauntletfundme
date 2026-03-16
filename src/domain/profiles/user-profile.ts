import {
  normalizeSlug,
  requireDate,
  requireNonEmptyString,
} from "@/domain/shared";

export const profileTypes = ["supporter", "organizer"] as const;

export type ProfileType = (typeof profileTypes)[number];

export type UserProfile = {
  id: string;
  userId: string;
  slug: string;
  bio: string;
  avatarUrl: string | null;
  profileType: ProfileType;
  createdAt: Date;
};

export type CreateUserProfileInput = UserProfile;

export const createUserProfile = (
  input: CreateUserProfileInput,
): UserProfile => ({
  id: requireNonEmptyString(input.id, "id"),
  userId: requireNonEmptyString(input.userId, "userId"),
  slug: normalizeSlug(input.slug, "slug"),
  bio: requireNonEmptyString(input.bio, "bio"),
  avatarUrl: input.avatarUrl?.trim() || null,
  profileType: input.profileType,
  createdAt: requireDate(input.createdAt, "createdAt"),
});
