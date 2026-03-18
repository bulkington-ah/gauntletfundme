import type { Community } from "@/domain";

import type {
  PublicActorSummary,
  PublicCommunityReference,
  PublicCommunitySummary,
  PublicFundraiserBrowseEntry,
  PublicFundraiserSummary,
} from "./contracts";
import type {
  PublicActorSnapshot,
  PublicCommunitySummarySnapshot,
  PublicFundraiserSummarySnapshot,
} from "./ports";

export const toPublicActorSummary = (
  snapshot: PublicActorSnapshot,
): PublicActorSummary => ({
  displayName: snapshot.user.displayName,
  profileSlug: snapshot.profile?.slug ?? null,
  avatarUrl: snapshot.profile?.avatarUrl ?? null,
});

export const toPublicCommunityReference = (
  community: Community,
): PublicCommunityReference => ({
  slug: community.slug,
  name: community.name,
  visibility: community.visibility,
});

export const toPublicFundraiserSummary = (
  snapshot: PublicFundraiserSummarySnapshot,
): PublicFundraiserSummary => ({
  slug: snapshot.fundraiser.slug,
  title: snapshot.fundraiser.title,
  status: snapshot.fundraiser.status,
  goalAmount: snapshot.fundraiser.goalAmount,
  amountRaised: snapshot.amountRaised,
  supporterCount: snapshot.supporterCount,
  donationCount: snapshot.donationCount,
});

export const toPublicFundraiserBrowseEntry = (
  snapshot: PublicFundraiserSummarySnapshot,
): PublicFundraiserBrowseEntry => ({
  ...toPublicFundraiserSummary(snapshot),
  storyExcerpt: toExcerpt(snapshot.fundraiser.story, 140),
  organizer: {
    displayName: snapshot.owner.displayName,
    role: snapshot.owner.role,
    profileSlug: snapshot.ownerProfile?.slug ?? null,
    avatarUrl: snapshot.ownerProfile?.avatarUrl ?? null,
  },
  community: snapshot.relatedCommunity
    ? toPublicCommunityReference(snapshot.relatedCommunity)
    : null,
});

export const toPublicCommunitySummary = (
  snapshot: PublicCommunitySummarySnapshot,
): PublicCommunitySummary => ({
  ...toPublicCommunityReference(snapshot.community),
  description: snapshot.community.description,
  followerCount: snapshot.followerCount,
  fundraiserCount: snapshot.fundraiserCount,
  owner: {
    displayName: snapshot.owner.displayName,
    role: snapshot.owner.role,
    profileSlug: snapshot.ownerProfile?.slug ?? null,
    avatarUrl: snapshot.ownerProfile?.avatarUrl ?? null,
  },
});

const toExcerpt = (value: string, maxLength: number): string => {
  const normalizedValue = value.trim().replace(/\s+/g, " ");

  if (normalizedValue.length <= maxLength) {
    return normalizedValue;
  }

  return `${normalizedValue.slice(0, maxLength - 3).trimEnd()}...`;
};
