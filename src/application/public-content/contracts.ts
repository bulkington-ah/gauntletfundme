import type {
  CommunityVisibility,
  FundraiserStatus,
  ModerationStatus,
  PostStatus,
  ProfileType,
  UserRole,
} from "@/domain";

export type LookupBySlugRequest = {
  slug: string;
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
  };
  connections: {
    fundraisers: Array<{
      slug: string;
      title: string;
      status: FundraiserStatus;
      goalAmount: number;
    }>;
    communities: Array<{
      slug: string;
      name: string;
      visibility: CommunityVisibility;
    }>;
  };
};

export type PublicFundraiserResponse = {
  kind: "fundraiser";
  fundraiser: {
    slug: string;
    title: string;
    story: string;
    status: FundraiserStatus;
    goalAmount: number;
    donationIntentCount: number;
  };
  organizer: {
    displayName: string;
    role: UserRole;
    profileSlug: string | null;
  };
  community: {
    slug: string;
    name: string;
    visibility: CommunityVisibility;
  } | null;
};

export type PublicCommunityResponse = {
  kind: "community";
  community: {
    slug: string;
    name: string;
    description: string;
    visibility: CommunityVisibility;
    followerCount: number;
  };
  owner: {
    displayName: string;
    role: UserRole;
    profileSlug: string | null;
  };
  featuredFundraiser: {
    slug: string;
    title: string;
    status: FundraiserStatus;
    goalAmount: number;
  } | null;
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
