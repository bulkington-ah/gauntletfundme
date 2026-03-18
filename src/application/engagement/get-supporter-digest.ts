import {
  buildSupporterDigestFallbackRenderedEvent,
  buildSupporterDigestViewedEvent,
  type AnalyticsEventPublisher,
} from "@/application/analytics";
import type {
  RankedSupporterDigestCandidate,
  SupporterDigestCandidate,
  SupporterDigestCandidateType,
} from "@/domain";
import { rankSupporterDigestCandidates } from "@/domain";

import type {
  AuthenticatedViewer,
  SessionViewerGateway,
  SupporterDigestNarration,
  SupporterDigestNarrator,
  SupporterDigestReadRepository,
  SupporterDigestStateRepository,
} from "./ports";

const fallbackWindowDurationInDays = 7;
const milestoneThresholds = [25, 50, 75, 100] as const;

export type GetSupporterDigestRequest = {
  sessionToken: string | null;
};

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

export type SupporterDigestResponse = {
  kind: "supporter_digest";
  windowStart: string;
  windowEnd: string;
  generationMode: "openai" | "deterministic";
  highlights: SupporterDigestHighlight[];
};

export type GetSupporterDigestResult =
  | {
      status: "unauthorized";
      message: string;
    }
  | {
      status: "success";
      viewer: AuthenticatedViewer;
      digest: SupporterDigestResponse;
    };

type Dependencies = {
  analyticsEventPublisher?: AnalyticsEventPublisher;
  sessionViewerGateway: SessionViewerGateway;
  supporterDigestNarrator: SupporterDigestNarrator;
  supporterDigestReadRepository: SupporterDigestReadRepository;
  supporterDigestStateRepository: SupporterDigestStateRepository;
  now?: () => Date;
};

export const getSupporterDigest = async (
  dependencies: Dependencies,
  request: GetSupporterDigestRequest,
): Promise<GetSupporterDigestResult> => {
  const viewer = await dependencies.sessionViewerGateway.findViewerBySessionToken(
    request.sessionToken,
  );

  if (!viewer) {
    return {
      status: "unauthorized",
      message: "Authentication is required to view your digest.",
    };
  }

  const now = dependencies.now?.() ?? new Date();
  const baseline =
    await dependencies.supporterDigestReadRepository.findSupporterDigestViewerBaseline(
      viewer.userId,
    );

  if (!baseline) {
    throw new Error(
      `Expected a digest baseline for viewer "${viewer.userId}" to exist.`,
    );
  }

  const digestState =
    await dependencies.supporterDigestStateRepository.findSupporterDigestStateByUserId(
      viewer.userId,
    );
  const windowStart =
    digestState?.lastViewedAt ??
    maxDate(
      baseline.viewerCreatedAt,
      subtractDays(now, fallbackWindowDurationInDays),
    );
  const windowEnd = now;
  const [fundraiserActivity, communityUpdates, discussionBursts] =
    await Promise.all([
      dependencies.supporterDigestReadRepository.listSupporterDigestFundraiserActivity(
        {
          userId: viewer.userId,
          windowStart,
          windowEnd,
        },
      ),
      dependencies.supporterDigestReadRepository.listSupporterDigestCommunityUpdates({
        userId: viewer.userId,
        windowStart,
        windowEnd,
      }),
      dependencies.supporterDigestReadRepository.listSupporterDigestDiscussionBursts({
        userId: viewer.userId,
        windowStart,
        windowEnd,
      }),
    ]);

  const rankedHighlights = rankSupporterDigestCandidates(
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
    { now },
  );

  const fallbackHighlights = rankedHighlights.map(toDeterministicHighlight);
  let generationMode: SupporterDigestResponse["generationMode"] = "deterministic";
  let highlights = fallbackHighlights;

  if (rankedHighlights.length > 0) {
    const narrationResult = await dependencies.supporterDigestNarrator.narrateDigest({
      viewerUserId: viewer.userId,
      windowStart,
      windowEnd,
      highlights: rankedHighlights,
    });

    const narratedHighlights =
      narrationResult.status === "success"
        ? toNarratedHighlights(rankedHighlights, narrationResult.items)
        : null;

    if (narratedHighlights) {
      generationMode = "openai";
      highlights = narratedHighlights;
    } else {
      await dependencies.analyticsEventPublisher?.publish(
        buildSupporterDigestFallbackRenderedEvent({
          viewerUserId: viewer.userId,
          highlightCount: rankedHighlights.length,
        }),
      );
    }
  }

  await dependencies.analyticsEventPublisher?.publish(
    buildSupporterDigestViewedEvent({
      viewerUserId: viewer.userId,
      generationMode,
      highlightCount: highlights.length,
    }),
  );

  return {
    status: "success",
    viewer,
    digest: {
      kind: "supporter_digest",
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
      generationMode,
      highlights,
    },
  };
};

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

const toNarratedHighlights = (
  rankedHighlights: RankedSupporterDigestCandidate[],
  narrationItems: SupporterDigestNarration[],
): SupporterDigestHighlight[] | null => {
  const narrationByCandidateId = new Map(
    narrationItems.map((item) => [item.candidateId, item]),
  );

  const highlights = rankedHighlights.map((candidate) => {
    const narration = narrationByCandidateId.get(candidate.id);

    if (
      !narration ||
      !narration.headline.trim() ||
      !narration.body.trim() ||
      !narration.ctaLabel.trim()
    ) {
      return null;
    }

    return {
      id: candidate.id,
      type: candidate.type,
      headline: narration.headline.trim(),
      body: narration.body.trim(),
      ctaLabel: narration.ctaLabel.trim(),
      href: candidate.href,
      occurredAt: candidate.createdAt.toISOString(),
      score: candidate.score,
    } satisfies SupporterDigestHighlight;
  });

  return highlights.every((highlight) => highlight !== null) ? highlights : null;
};

const subtractDays = (value: Date, days: number): Date =>
  new Date(value.getTime() - days * 24 * 60 * 60 * 1000);

const maxDate = (left: Date, right: Date): Date =>
  left.getTime() >= right.getTime() ? left : right;

const formatCompactCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
