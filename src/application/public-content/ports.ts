import type {
  Comment,
  Community,
  Donation,
  Fundraiser,
  Post,
  User,
  UserProfile,
} from "@/domain";

export type PublicActorSnapshot = {
  user: User;
  profile: UserProfile | null;
};

export type ViewerFollowStateSnapshot = {
  isFollowing: boolean;
  isOwnTarget: boolean;
};

export type PublicDetailLookup = {
  slug: string;
  viewerUserId?: string | null;
};

export type PublicFundraiserSummarySnapshot = {
  fundraiser: Fundraiser;
  owner: User;
  ownerProfile: UserProfile | null;
  relatedCommunity: Community | null;
  donationCount: number;
  supporterCount: number;
  amountRaised: number;
};

export type PublicFundraiserDonationSnapshot = {
  actor: PublicActorSnapshot;
  donation: Donation;
};

export type PublicCommunitySummarySnapshot = {
  community: Community;
  owner: User;
  ownerProfile: UserProfile | null;
  followerCount: number;
  fundraiserCount: number;
};

export type PublicProfileActivitySnapshot =
  | {
      type: "fundraiser_donation";
      actor: PublicActorSnapshot;
      fundraiser: PublicFundraiserSummarySnapshot;
      community: Community | null;
      donation: Donation;
    }
  | {
      type: "community_post";
      actor: PublicActorSnapshot;
      community: Community;
      post: Post;
    };

export type PublicProfileSnapshot = {
  user: User;
  profile: UserProfile;
  viewerFollowState: ViewerFollowStateSnapshot | null;
  followerCount: number;
  followingCount: number;
  inspiredSupporterCount: number;
  followers: PublicActorSnapshot[];
  following: PublicActorSnapshot[];
  featuredFundraisers: PublicFundraiserSummarySnapshot[];
  ownedCommunities: Community[];
  recentActivity: PublicProfileActivitySnapshot[];
};

export type PublicFundraiserSnapshot = {
  summary: PublicFundraiserSummarySnapshot;
  viewerFollowState: ViewerFollowStateSnapshot | null;
  recentDonations: PublicFundraiserDonationSnapshot[];
};

export type CommunityDiscussionSnapshot = {
  post: Post;
  author: User;
  authorProfile: UserProfile | null;
  comments: Array<{
    comment: Comment;
    author: User;
    authorProfile: UserProfile | null;
  }>;
};

export type PublicCommunitySnapshot = {
  community: Community;
  owner: User;
  ownerProfile: UserProfile | null;
  viewerFollowState: ViewerFollowStateSnapshot | null;
  featuredFundraiser: PublicFundraiserSummarySnapshot | null;
  fundraisers: PublicFundraiserSummarySnapshot[];
  followerCount: number;
  amountRaised: number;
  donationCount: number;
  discussion: CommunityDiscussionSnapshot[];
};

export interface PublicContentReadRepository {
  findProfileBySlug(
    input: PublicDetailLookup,
  ): Promise<PublicProfileSnapshot | null>;
  findFundraiserBySlug(
    input: PublicDetailLookup,
  ): Promise<PublicFundraiserSnapshot | null>;
  findCommunityBySlug(
    input: PublicDetailLookup,
  ): Promise<PublicCommunitySnapshot | null>;
  listFundraisers(): Promise<PublicFundraiserSummarySnapshot[]>;
  listCommunities(): Promise<PublicCommunitySummarySnapshot[]>;
  findProfileSlugByUserId(userId: string): Promise<string | null>;
}
