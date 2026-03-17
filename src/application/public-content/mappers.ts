import type { Community } from "@/domain";

import type {
  PublicActorSummary,
  PublicCommunityReference,
  PublicFundraiserSummary,
} from "./contracts";
import type {
  PublicActorSnapshot,
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
  supportAmount: snapshot.supportAmount,
  supporterCount: snapshot.supporterCount,
  donationIntentCount: snapshot.donationIntentCount,
});
