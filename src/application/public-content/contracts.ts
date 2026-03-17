import type {
  CommunityVisibility,
  DonationIntentStatus,
  FundraiserStatus,
  ModerationStatus,
  PostStatus,
  ProfileType,
  UserRole,
} from "@/domain";

export type LookupBySlugRequest = {
  slug: string;
};

export type PublicActorSummary = {
  displayName: string;
  profileSlug: string | null;
  avatarUrl: string | null;
};

export type PublicCommunityReference = {
  slug: string;
  name: string;
  visibility: CommunityVisibility;
};

export type PublicFundraiserSummary = {
  slug: string;
  title: string;
  status: FundraiserStatus;
  goalAmount: number;
  supportAmount: number;
  supporterCount: number;
  donationIntentCount: number;
};

export type PublicFundraiserSupporter = PublicActorSummary & {
  amount: number;
  status: DonationIntentStatus;
  createdAt: string;
};

export type PublicProfileActivity = {
  id: string;
  type: "fundraiser_support" | "community_post";
  actor: PublicActorSummary;
  createdAt: string;
  summary: string;
  detail: string | null;
  fundraiser: PublicFundraiserSummary | null;
  community: PublicCommunityReference | null;
  amount: number | null;
};

export type PublicProfileResponse = {
  kind: "profile";
  profile: {
    slug: string;
    displayName: string;
    role: UserRole;
    profileType: ProfileType;
    bio: string;
    avatarUrl: string | null;
    followerCount: number;
    followingCount: number;
    inspiredSupporterCount: number;
  };
  connections: {
    fundraisers: PublicFundraiserSummary[];
    communities: PublicCommunityReference[];
  };
  recentActivity: PublicProfileActivity[];
};

export type PublicFundraiserResponse = {
  kind: "fundraiser";
  fundraiser: PublicFundraiserSummary & {
    story: string;
  };
  organizer: PublicActorSummary & {
    role: UserRole;
  };
  community: PublicCommunityReference | null;
  recentSupporters: PublicFundraiserSupporter[];
};

export type PublicCommunityResponse = {
  kind: "community";
  community: {
    slug: string;
    name: string;
    description: string;
    visibility: CommunityVisibility;
    followerCount: number;
    fundraiserCount: number;
    supportAmount: number;
    donationIntentCount: number;
  };
  owner: PublicActorSummary & {
    role: UserRole;
  };
  featuredFundraiser: PublicFundraiserSummary | null;
  leaderboard: Array<{
    rank: number;
    fundraiser: PublicFundraiserSummary;
  }>;
  fundraisers: PublicFundraiserSummary[];
  discussion: Array<{
    id: string;
    title: string;
    body: string;
    status: PostStatus;
    moderationStatus: ModerationStatus;
    authorDisplayName: string;
    createdAt: string;
    comments: Array<{
      id: string;
      body: string;
      moderationStatus: ModerationStatus;
      authorDisplayName: string;
      createdAt: string;
    }>;
  }>;
};

export type PublicQueryResult<TResponse> =
  | {
      status: "success";
      data: TResponse;
    }
  | {
      status: "invalid_request";
      message: string;
    }
  | {
      status: "not_found";
      message: string;
    };
