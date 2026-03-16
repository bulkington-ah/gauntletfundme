import type {
  Comment,
  Community,
  Fundraiser,
  Post,
  User,
  UserProfile,
} from "@/domain";

export type PublicProfileSnapshot = {
  user: User;
  profile: UserProfile;
  followerCount: number;
  featuredFundraisers: Fundraiser[];
  ownedCommunities: Community[];
};

export type PublicFundraiserSnapshot = {
  fundraiser: Fundraiser;
  owner: User;
  ownerProfile: UserProfile | null;
  relatedCommunity: Community | null;
  donationIntentCount: number;
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
  featuredFundraiser: Fundraiser | null;
  followerCount: number;
  discussion: CommunityDiscussionSnapshot[];
};

export interface PublicContentReadRepository {
  findProfileBySlug(slug: string): Promise<PublicProfileSnapshot | null>;
  findFundraiserBySlug(slug: string): Promise<PublicFundraiserSnapshot | null>;
  findCommunityBySlug(slug: string): Promise<PublicCommunitySnapshot | null>;
}
