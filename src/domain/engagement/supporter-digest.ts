import { requireDate, requireNonEmptyString } from "@/domain/shared";

export const supporterDigestCandidateTypes = [
  "community_update",
  "community_discussion_burst",
  "fundraiser_momentum",
  "fundraiser_milestone",
] as const;

export type SupporterDigestCandidateType =
  (typeof supporterDigestCandidateTypes)[number];

type SupporterDigestCandidateBase = {
  id: string;
  type: SupporterDigestCandidateType;
  entityKey: string;
  href: string;
  createdAt: Date;
};

export type CommunityUpdateDigestCandidate = SupporterDigestCandidateBase & {
  type: "community_update";
  communitySlug: string;
  communityName: string;
  organizerDisplayName: string;
  postId: string;
  postTitle: string;
};

export type CommunityDiscussionBurstDigestCandidate =
  SupporterDigestCandidateBase & {
    type: "community_discussion_burst";
    communitySlug: string;
    communityName: string;
    postId: string;
    postTitle: string;
    newCommentCount: number;
    participantCount: number;
  };

export type FundraiserMomentumDigestCandidate = SupporterDigestCandidateBase & {
  type: "fundraiser_momentum";
  fundraiserSlug: string;
  fundraiserTitle: string;
  newDonationCount: number;
  newAmountRaised: number;
  newSupporterCount: number;
};

export type FundraiserMilestoneDigestCandidate = SupporterDigestCandidateBase & {
  type: "fundraiser_milestone";
  fundraiserSlug: string;
  fundraiserTitle: string;
  milestonePercent: 25 | 50 | 75 | 100;
  goalAmount: number;
  amountRaisedAfterWindow: number;
  newDonationCount: number;
  newAmountRaised: number;
};

export type SupporterDigestCandidate =
  | CommunityDiscussionBurstDigestCandidate
  | CommunityUpdateDigestCandidate
  | FundraiserMomentumDigestCandidate
  | FundraiserMilestoneDigestCandidate;

export type RankedSupporterDigestCandidate = SupporterDigestCandidate & {
  score: number;
};

export const rankSupporterDigestCandidates = (
  candidates: SupporterDigestCandidate[],
  options: {
    limit?: number;
    now?: Date;
  } = {},
): RankedSupporterDigestCandidate[] => {
  const now = options.now ?? new Date();
  const limit = options.limit ?? 7;
  const scoredCandidates = candidates
    .map((candidate) => ({
      ...normalizeCandidate(candidate),
      score: calculateCandidateScore(candidate, now),
    }))
    .sort(compareRankedCandidates);
  const dedupedByEntityKey = new Map<string, RankedSupporterDigestCandidate>();

  for (const candidate of scoredCandidates) {
    if (!dedupedByEntityKey.has(candidate.entityKey)) {
      dedupedByEntityKey.set(candidate.entityKey, candidate);
    }
  }

  return Array.from(dedupedByEntityKey.values())
    .sort(compareRankedCandidates)
    .slice(0, limit);
};

const normalizeCandidate = (
  candidate: SupporterDigestCandidate,
): SupporterDigestCandidate => ({
  ...candidate,
  id: requireNonEmptyString(candidate.id, "id"),
  entityKey: requireNonEmptyString(candidate.entityKey, "entityKey"),
  href: requireNonEmptyString(candidate.href, "href"),
  createdAt: requireDate(candidate.createdAt, "createdAt"),
});

const compareRankedCandidates = (
  left: RankedSupporterDigestCandidate,
  right: RankedSupporterDigestCandidate,
): number => {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  return right.createdAt.getTime() - left.createdAt.getTime();
};

const calculateCandidateScore = (
  candidate: SupporterDigestCandidate,
  now: Date,
): number => {
  const recencyBoost = calculateRecencyBoost(candidate.createdAt, now);

  switch (candidate.type) {
    case "fundraiser_milestone":
      return (
        150 +
        recencyBoost +
        Math.min(
          30,
          candidate.newDonationCount * 5 +
            Math.floor(candidate.newAmountRaised / 5_000),
        )
      );
    case "community_update":
      return 120 + recencyBoost + 18;
    case "fundraiser_momentum":
      return (
        105 +
        recencyBoost +
        Math.min(
          36,
          candidate.newDonationCount * 6 +
            candidate.newSupporterCount * 3 +
            Math.floor(candidate.newAmountRaised / 7_500),
        )
      );
    case "community_discussion_burst":
      return (
        90 +
        recencyBoost +
        Math.min(
          34,
          candidate.newCommentCount * 6 + candidate.participantCount * 4,
        )
      );
  }
};

const calculateRecencyBoost = (createdAt: Date, now: Date): number => {
  const diffInHours = Math.max(
    0,
    (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60),
  );

  return Math.max(0, 36 - Math.floor(diffInHours));
};
