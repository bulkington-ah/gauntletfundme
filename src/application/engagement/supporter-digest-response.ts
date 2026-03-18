import type {
  RankedSupporterDigestCandidate,
  SupporterDigestCandidate,
  SupporterDigestCandidateType,
} from "@/domain";
import { rankSupporterDigestCandidates } from "@/domain";

import type {
  SupporterDigestNarrationResult,
  SupporterDigestNarrationUnavailableReason,
  SupporterDigestReadRepository,
} from "./ports";

const milestoneThresholds = [25, 50, 75, 100] as const;

export type SupporterDigestHighlight = {
  id: string;
  type: SupporterDigestCandidateType;
  headline: string;
  body: string;
  ctaLabel: string;
  href: string;
  occurredAt: string;
  score: number;
};

export type SupporterDigestNarrationState =
  | {
      status: "not_requested" | "pending" | "completed";
      reason: null;
    }
  | {
      status: "unavailable";
      reason: SupporterDigestNarrationUnavailableReason;
    };

export type SupporterDigestResponse = {
  kind: "supporter_digest";
  windowStart: string;
  windowEnd: string;
  generationMode: "openai" | "deterministic";
  narration: SupporterDigestNarrationState;
  summaryParagraph: string | null;
  highlights: SupporterDigestHighlight[];
};

export const listRankedSupporterDigestCandidates = async (
  repository: SupporterDigestReadRepository,
  input: {
    userId: string;
    windowStart: Date;
    windowEnd: Date;
    rankingNow: Date;
  },
): Promise<RankedSupporterDigestCandidate[]> => {
  const [fundraiserActivity, communityUpdates, discussionBursts] =
    await Promise.all([
      repository.listSupporterDigestFundraiserActivity({
        userId: input.userId,
        windowStart: input.windowStart,
        windowEnd: input.windowEnd,
      }),
      repository.listSupporterDigestCommunityUpdates({
        userId: input.userId,
        windowStart: input.windowStart,
        windowEnd: input.windowEnd,
      }),
      repository.listSupporterDigestDiscussionBursts({
        userId: input.userId,
        windowStart: input.windowStart,
        windowEnd: input.windowEnd,
      }),
    ]);

  return rankSupporterDigestCandidates(
    [
      ...buildFundraiserCandidates(fundraiserActivity),
      ...communityUpdates.map<SupporterDigestCandidate>((update) => ({
        id: `community_update:${update.postId}`,
        type: "community_update",
        entityKey: `community_post:${update.postId}`,
        href: `/communities/${update.communitySlug}#post-${update.postId}`,
        createdAt: update.publishedAt,
        communitySlug: update.communitySlug,
        communityName: update.communityName,
        organizerDisplayName: update.organizerDisplayName,
        postId: update.postId,
        postTitle: update.postTitle,
      })),
      ...discussionBursts.map<SupporterDigestCandidate>((burst) => ({
        id: `community_discussion_burst:${burst.postId}`,
        type: "community_discussion_burst",
        entityKey: `community_post:${burst.postId}`,
        href: `/communities/${burst.communitySlug}#post-${burst.postId}`,
        createdAt: burst.lastCommentAt,
        communitySlug: burst.communitySlug,
        communityName: burst.communityName,
        postId: burst.postId,
        postTitle: burst.postTitle,
        newCommentCount: burst.newCommentCount,
        participantCount: burst.participantCount,
      })),
    ],
    { now: input.rankingNow },
  );
};

export const buildInitialSupporterDigestResponse = (input: {
  rankedHighlights: RankedSupporterDigestCandidate[];
  windowStart: Date;
  windowEnd: Date;
}): SupporterDigestResponse => ({
  kind: "supporter_digest",
  windowStart: input.windowStart.toISOString(),
  windowEnd: input.windowEnd.toISOString(),
  generationMode: "deterministic",
  narration:
    input.rankedHighlights.length > 0
      ? {
          status: "pending",
          reason: null,
        }
      : {
          status: "not_requested",
          reason: null,
        },
  summaryParagraph: null,
  highlights: input.rankedHighlights.map(toDeterministicHighlight),
});

export const buildNarratedSupporterDigestResponse = (input: {
  rankedHighlights: RankedSupporterDigestCandidate[];
  windowStart: Date;
  windowEnd: Date;
  narrationResult: SupporterDigestNarrationResult;
}): SupporterDigestResponse => {
  const deterministicHighlights = input.rankedHighlights.map(
    toDeterministicHighlight,
  );

  if (input.rankedHighlights.length === 0) {
    return {
      kind: "supporter_digest",
      windowStart: input.windowStart.toISOString(),
      windowEnd: input.windowEnd.toISOString(),
      generationMode: "deterministic",
      narration: {
        status: "not_requested",
        reason: null,
      },
      summaryParagraph: null,
      highlights: deterministicHighlights,
    };
  }

  if (input.narrationResult.status === "success") {
    const summaryParagraph = input.narrationResult.summary.trim();

    if (summaryParagraph) {
      return {
        kind: "supporter_digest",
        windowStart: input.windowStart.toISOString(),
        windowEnd: input.windowEnd.toISOString(),
        generationMode: "openai",
        narration: {
          status: "completed",
          reason: null,
        },
        summaryParagraph,
        highlights: deterministicHighlights,
      };
    }
  }

  return {
    kind: "supporter_digest",
    windowStart: input.windowStart.toISOString(),
    windowEnd: input.windowEnd.toISOString(),
    generationMode: "deterministic",
    narration: {
      status: "unavailable",
      reason:
        input.narrationResult.status === "success"
          ? "invalid_response"
          : input.narrationResult.reason,
    },
    summaryParagraph: null,
    highlights: deterministicHighlights,
  };
};

export const subtractDays = (value: Date, days: number): Date =>
  new Date(value.getTime() - days * 24 * 60 * 60 * 1000);

export const maxDate = (left: Date, right: Date): Date =>
  left.getTime() >= right.getTime() ? left : right;

const buildFundraiserCandidates = (
  fundraiserActivity: Awaited<
    ReturnType<SupporterDigestReadRepository["listSupporterDigestFundraiserActivity"]>
  >,
): SupporterDigestCandidate[] =>
  fundraiserActivity.flatMap((activity) => {
    const candidates: SupporterDigestCandidate[] = [];

    if (activity.newDonationCount > 0) {
      candidates.push({
        id: `fundraiser_momentum:${activity.fundraiserId}`,
        type: "fundraiser_momentum",
        entityKey: `fundraiser:${activity.fundraiserId}`,
        href: `/fundraisers/${activity.fundraiserSlug}`,
        createdAt: activity.lastDonationAt,
        fundraiserSlug: activity.fundraiserSlug,
        fundraiserTitle: activity.fundraiserTitle,
        newDonationCount: activity.newDonationCount,
        newAmountRaised: activity.newAmountRaised,
        newSupporterCount: activity.newSupporterCount,
      });
    }

    const milestonePercent = findCrossedMilestonePercent(activity);

    if (milestonePercent) {
      candidates.push({
        id: `fundraiser_milestone:${activity.fundraiserId}:${milestonePercent}`,
        type: "fundraiser_milestone",
        entityKey: `fundraiser:${activity.fundraiserId}`,
        href: `/fundraisers/${activity.fundraiserSlug}`,
        createdAt: activity.lastDonationAt,
        fundraiserSlug: activity.fundraiserSlug,
        fundraiserTitle: activity.fundraiserTitle,
        milestonePercent,
        goalAmount: activity.goalAmount,
        amountRaisedAfterWindow: activity.amountRaisedAfterWindow,
        newDonationCount: activity.newDonationCount,
        newAmountRaised: activity.newAmountRaised,
      });
    }

    return candidates;
  });

const findCrossedMilestonePercent = (
  activity: Awaited<
    ReturnType<SupporterDigestReadRepository["listSupporterDigestFundraiserActivity"]>
  >[number],
): 25 | 50 | 75 | 100 | null => {
  if (activity.goalAmount <= 0) {
    return null;
  }

  const previousProgress = Math.floor(
    (activity.amountRaisedBeforeWindow / activity.goalAmount) * 100,
  );
  const currentProgress = Math.floor(
    (activity.amountRaisedAfterWindow / activity.goalAmount) * 100,
  );

  const crossedThreshold = [...milestoneThresholds]
    .reverse()
    .find(
      (threshold) =>
        previousProgress < threshold && currentProgress >= threshold,
    );

  return crossedThreshold ?? null;
};

const toDeterministicHighlight = (
  candidate: RankedSupporterDigestCandidate,
): SupporterDigestHighlight => {
  switch (candidate.type) {
    case "community_update":
      return {
        id: candidate.id,
        type: candidate.type,
        headline: `${candidate.organizerDisplayName} posted a new update in ${candidate.communityName}.`,
        body: `"${candidate.postTitle}" is a fresh organizer update in ${candidate.communityName}.`,
        ctaLabel: "Read update",
        href: candidate.href,
        occurredAt: candidate.createdAt.toISOString(),
        score: candidate.score,
      };
    case "community_discussion_burst":
      return {
        id: candidate.id,
        type: candidate.type,
        headline: `${candidate.communityName} has new discussion activity.`,
        body: `"${candidate.postTitle}" picked up ${candidate.newCommentCount} new comments from ${candidate.participantCount} participants.`,
        ctaLabel: "Join discussion",
        href: candidate.href,
        occurredAt: candidate.createdAt.toISOString(),
        score: candidate.score,
      };
    case "fundraiser_momentum":
      return {
        id: candidate.id,
        type: candidate.type,
        headline: `${candidate.fundraiserTitle} picked up momentum.`,
        body: `${candidate.newDonationCount} new donations added ${formatCompactCurrency(candidate.newAmountRaised)} across ${candidate.newSupporterCount} supporters.`,
        ctaLabel: "Support fundraiser",
        href: candidate.href,
        occurredAt: candidate.createdAt.toISOString(),
        score: candidate.score,
      };
    case "fundraiser_milestone":
      return {
        id: candidate.id,
        type: candidate.type,
        headline: `${candidate.fundraiserTitle} crossed ${candidate.milestonePercent}% of its goal.`,
        body: `${formatCompactCurrency(candidate.amountRaisedAfterWindow)} has been raised toward the ${formatCompactCurrency(candidate.goalAmount)} goal.`,
        ctaLabel: "View fundraiser",
        href: candidate.href,
        occurredAt: candidate.createdAt.toISOString(),
        score: candidate.score,
      };
  }
};

const formatCompactCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
