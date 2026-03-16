import {
  normalizeSlug,
  requireDate,
  requireNonEmptyString,
  requirePositiveInteger,
} from "@/domain/shared";

export const fundraiserStatuses = ["draft", "active", "closed"] as const;

export type FundraiserStatus = (typeof fundraiserStatuses)[number];

export type Fundraiser = {
  id: string;
  ownerUserId: string;
  slug: string;
  title: string;
  story: string;
  status: FundraiserStatus;
  goalAmount: number;
  createdAt: Date;
};

export type CreateFundraiserInput = Fundraiser;

export const createFundraiser = (
  input: CreateFundraiserInput,
): Fundraiser => ({
  id: requireNonEmptyString(input.id, "id"),
  ownerUserId: requireNonEmptyString(input.ownerUserId, "ownerUserId"),
  slug: normalizeSlug(input.slug, "slug"),
  title: requireNonEmptyString(input.title, "title"),
  story: requireNonEmptyString(input.story, "story"),
  status: input.status,
  goalAmount: requirePositiveInteger(input.goalAmount, "goalAmount"),
  createdAt: requireDate(input.createdAt, "createdAt"),
});
