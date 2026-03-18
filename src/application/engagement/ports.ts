import type {
  Donation,
  Follow,
  RankedSupporterDigestCandidate,
  FollowTargetType,
  UserRole,
} from "@/domain";

export type AuthenticatedViewer = {
  userId: string;
  role: UserRole;
};

export type FollowTargetReference = {
  id: string;
  slug: string;
  targetType: FollowTargetType;
};

export interface SessionViewerGateway {
  findViewerBySessionToken(
    sessionToken: string | null,
  ): Promise<AuthenticatedViewer | null>;
}

export interface FollowTargetLookup {
  findTargetBySlug(
    targetType: FollowTargetType,
    slug: string,
  ): Promise<FollowTargetReference | null>;
}

export type FollowOwnerLookup = {
  findOwnerUserIdByTarget(
    targetType: FollowTargetType,
    targetId: string,
  ): Promise<string | null>;
};

export type FollowWriteResult = {
  follow: Follow;
  created: boolean;
};

export interface FollowWriteRepository {
  createFollowIfAbsent(input: {
    userId: string;
    targetType: FollowTargetType;
    targetId: string;
  }): Promise<FollowWriteResult>;
  removeFollowIfPresent(input: {
    userId: string;
    targetType: FollowTargetType;
    targetId: string;
  }): Promise<{
    removed: boolean;
  }>;
  countFollowersForTarget(input: {
    targetType: FollowTargetType;
    targetId: string;
  }): Promise<number>;
}

export type DonationFundraiserReference = {
  id: string;
  slug: string;
};

export interface DonationTargetLookup {
  findFundraiserBySlugForDonation(
    fundraiserSlug: string,
  ): Promise<DonationFundraiserReference | null>;
}

export interface DonationWriteRepository {
  createDonation(input: {
    userId: string;
    fundraiserId: string;
    amount: number;
  }): Promise<Donation>;
}

export type DonationIntentFundraiserReference = DonationFundraiserReference;

export interface DonationIntentTargetLookup extends DonationTargetLookup {
  findFundraiserBySlugForDonationIntent?(
    fundraiserSlug: string,
  ): Promise<DonationIntentFundraiserReference | null>;
}

export interface DonationIntentWriteRepository extends DonationWriteRepository {
  createDonationIntent?(input: {
    userId: string;
    fundraiserId: string;
    amount: number;
  }): Promise<Donation>;
}

export type SupporterDigestState = {
  lastViewedAt: Date | null;
};

export type SupporterDigestViewerBaseline = {
  viewerCreatedAt: Date;
};

export type SupporterDigestFundraiserActivitySnapshot = {
  fundraiserId: string;
  fundraiserSlug: string;
  fundraiserTitle: string;
  goalAmount: number;
  amountRaisedBeforeWindow: number;
  amountRaisedAfterWindow: number;
  newDonationCount: number;
  newAmountRaised: number;
  newSupporterCount: number;
  lastDonationAt: Date;
};

export type SupporterDigestCommunityUpdateSnapshot = {
  communityId: string;
  communitySlug: string;
  communityName: string;
  organizerDisplayName: string;
  postId: string;
  postTitle: string;
  publishedAt: Date;
};

export type SupporterDigestDiscussionBurstSnapshot = {
  communityId: string;
  communitySlug: string;
  communityName: string;
  postId: string;
  postTitle: string;
  newCommentCount: number;
  participantCount: number;
  lastCommentAt: Date;
};

export interface SupporterDigestReadRepository {
  findSupporterDigestViewerBaseline(
    userId: string,
  ): Promise<SupporterDigestViewerBaseline | null>;
  listSupporterDigestFundraiserActivity(input: {
    userId: string;
    windowStart: Date;
    windowEnd: Date;
  }): Promise<SupporterDigestFundraiserActivitySnapshot[]>;
  listSupporterDigestCommunityUpdates(input: {
    userId: string;
    windowStart: Date;
    windowEnd: Date;
  }): Promise<SupporterDigestCommunityUpdateSnapshot[]>;
  listSupporterDigestDiscussionBursts(input: {
    userId: string;
    windowStart: Date;
    windowEnd: Date;
  }): Promise<SupporterDigestDiscussionBurstSnapshot[]>;
}

export interface SupporterDigestStateRepository {
  findSupporterDigestStateByUserId(
    userId: string,
  ): Promise<SupporterDigestState | null>;
  recordSupporterDigestView(input: {
    userId: string;
    viewedThrough: Date;
  }): Promise<void>;
}

export type SupporterDigestNarrationUnavailableReason =
  | "missing_configuration"
  | "provider_error"
  | "invalid_response";

export type SupporterDigestNarrationResult =
  | {
      status: "success";
      summary: string;
    }
  | {
      status: "unavailable";
      reason: SupporterDigestNarrationUnavailableReason;
      message: string;
    };

export interface SupporterDigestNarrator {
  narrateDigest(input: {
    viewerUserId: string;
    windowStart: Date;
    windowEnd: Date;
    highlights: RankedSupporterDigestCandidate[];
  }): Promise<SupporterDigestNarrationResult>;
}
