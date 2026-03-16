import {
  normalizeSlug,
  requireDate,
  requireNonEmptyString,
} from "@/domain/shared";

export const communityVisibilities = [
  "public",
  "members_only",
  "private",
] as const;

export type CommunityVisibility = (typeof communityVisibilities)[number];

export type Community = {
  id: string;
  ownerUserId: string;
  slug: string;
  name: string;
  description: string;
  visibility: CommunityVisibility;
  createdAt: Date;
};

export type CreateCommunityInput = Community;

export const createCommunity = (input: CreateCommunityInput): Community => ({
  id: requireNonEmptyString(input.id, "id"),
  ownerUserId: requireNonEmptyString(input.ownerUserId, "ownerUserId"),
  slug: normalizeSlug(input.slug, "slug"),
  name: requireNonEmptyString(input.name, "name"),
  description: requireNonEmptyString(input.description, "description"),
  visibility: input.visibility,
  createdAt: requireDate(input.createdAt, "createdAt"),
});
