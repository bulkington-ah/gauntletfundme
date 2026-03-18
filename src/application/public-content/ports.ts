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
  followerCount: number;
  followingCount: number;
  inspiredSupporterCount: number;
  featuredFundraisers: PublicFundraiserSummarySnapshot[];
  ownedCommunities: Community[];
  recentActivity: PublicProfileActivitySnapshot[];
};

export type PublicFundraiserSnapshot = {
  summary: PublicFundraiserSummarySnapshot;
  recentDonations: PublicFundraiserDonationSnapshot[];
};

export type CommunityDiscussionSnapshot = {
  post: Post;
  author: User;
  comments: Array<{
    comment: Comment;
    author: User;
  }>;
};

export type PublicCommunitySnapshot = {
  community: Community;
  owner: User;
  ownerProfile: UserProfile | null;
  featuredFundraiser: PublicFundraiserSummarySnapshot | null;
  fundraisers: PublicFundraiserSummarySnapshot[];
  followerCount: number;
  amountRaised: number;
  donationCount: number;
  discussion: CommunityDiscussionSnapshot[];
};

export interface PublicContentReadRepository {
  findProfileBySlug(slug: string): Promise<PublicProfileSnapshot | null>;
  findFundraiserBySlug(slug: string): Promise<PublicFundraiserSnapshot | null>;
  findCommunityBySlug(slug: string): Promise<PublicCommunitySnapshot | null>;
  listFundraisers(): Promise<PublicFundraiserSummarySnapshot[]>;
  listCommunities(): Promise<PublicCommunitySummarySnapshot[]>;
  findProfileSlugByUserId(userId: string): Promise<string | null>;
}
