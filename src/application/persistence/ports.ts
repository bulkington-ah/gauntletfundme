import type {
  Comment,
  Community,
  Donation,
  Follow,
  FollowTargetType,
  Fundraiser,
  Post,
  Report,
  User,
  UserProfile,
} from "@/domain";

export interface UserRepository {
  findById(userId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

export interface UserProfileRepository {
  findById(profileId: string): Promise<UserProfile | null>;
  findBySlug(slug: string): Promise<UserProfile | null>;
  findByUserId(userId: string): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
}

export interface FundraiserRepository {
  findById(fundraiserId: string): Promise<Fundraiser | null>;
  findBySlug(slug: string): Promise<Fundraiser | null>;
  listByOwnerUserId(ownerUserId: string): Promise<Fundraiser[]>;
  save(fundraiser: Fundraiser): Promise<void>;
}

export interface CommunityRepository {
  findById(communityId: string): Promise<Community | null>;
  findBySlug(slug: string): Promise<Community | null>;
  listByOwnerUserId(ownerUserId: string): Promise<Community[]>;
  save(community: Community): Promise<void>;
}

export interface PostRepository {
  findById(postId: string): Promise<Post | null>;
  listPublishedByCommunityId(communityId: string): Promise<Post[]>;
  save(post: Post): Promise<void>;
}

export interface CommentRepository {
  findById(commentId: string): Promise<Comment | null>;
  listVisibleByPostId(postId: string): Promise<Comment[]>;
  save(comment: Comment): Promise<void>;
}

export interface FollowRepository {
  findById(followId: string): Promise<Follow | null>;
  findByUserAndTarget(input: {
    userId: string;
    targetType: FollowTargetType;
    targetId: string;
  }): Promise<Follow | null>;
  countByTarget(input: {
    targetType: FollowTargetType;
    targetId: string;
  }): Promise<number>;
  save(follow: Follow): Promise<void>;
}

export interface DonationRepository {
  findById(donationId: string): Promise<Donation | null>;
  countByFundraiserId(fundraiserId: string): Promise<number>;
  save(donation: Donation): Promise<void>;
}

export type DonationIntentRepository = DonationRepository;

export interface ReportRepository {
  findById(reportId: string): Promise<Report | null>;
  save(report: Report): Promise<void>;
}

export interface PrototypeDataResetRepository {
  resetPrototypeData(): Promise<void>;
}
