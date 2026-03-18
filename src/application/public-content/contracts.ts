import type {
  CommunityVisibility,
  DonationStatus,
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

export type PublicProfileRelationshipMember = PublicActorSummary & {
  role: UserRole;
  profileType: ProfileType | null;
  bio: string | null;
};

export type PublicCommunityReference = {
  slug: string;
  name: string;
  visibility: CommunityVisibility;
};

export type PublicCommunitySummary = PublicCommunityReference & {
  description: string;
  followerCount: number;
  fundraiserCount: number;
  owner: PublicActorSummary & {
    role: UserRole;
  };
};

export type PublicFundraiserSummary = {
  slug: string;
  title: string;
  status: FundraiserStatus;
  goalAmount: number;
  amountRaised: number;
  supporterCount: number;
  donationCount: number;
};

export type PublicFundraiserBrowseEntry = PublicFundraiserSummary & {
  storyExcerpt: string;
  organizer: PublicActorSummary & {
    role: UserRole;
  };
  community: PublicCommunityReference | null;
};

export type PublicFundraiserDonation = PublicActorSummary & {
  amount: number;
  status: DonationStatus;
  createdAt: string;
};

export type PublicProfileActivity = {
  id: string;
  type: "fundraiser_donation" | "community_post";
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
  relationships: {
    followers: PublicProfileRelationshipMember[];
    following: PublicProfileRelationshipMember[];
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
  recentDonations: PublicFundraiserDonation[];
};

export type PublicFundraiserListResponse = {
  kind: "fundraiser_list";
  fundraisers: PublicFundraiserBrowseEntry[];
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
    amountRaised: number;
    donationCount: number;
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
    authorProfileSlug: string | null;
    createdAt: string;
    comments: Array<{
      id: string;
      body: string;
      moderationStatus: ModerationStatus;
      authorDisplayName: string;
      authorProfileSlug: string | null;
      createdAt: string;
    }>;
  }>;
};

export type PublicCommunityListResponse = {
  kind: "community_list";
  communities: PublicCommunitySummary[];
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
