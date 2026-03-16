import type {
  CommentStatus,
  CommunityVisibility,
  DonationIntentStatus,
  FollowTargetType,
  FundraiserStatus,
  ModerationStatus,
  PostStatus,
  ProfileType,
  ReportStatus,
  ReportTargetType,
  UserRole,
} from "@/domain";

export type UserRecord = {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  created_at: string;
};

export type UserProfileRecord = {
  id: string;
  user_id: string;
  slug: string;
  bio: string;
  avatar_url: string | null;
  profile_type: ProfileType;
  created_at: string;
};

export type FundraiserRecord = {
  id: string;
  owner_user_id: string;
  slug: string;
  title: string;
  story: string;
  status: FundraiserStatus;
  goal_amount: number;
  created_at: string;
};

export type CommunityRecord = {
  id: string;
  owner_user_id: string;
  slug: string;
  name: string;
  description: string;
  visibility: CommunityVisibility;
  created_at: string;
};

export type PostRecord = {
  id: string;
  community_id: string;
  author_user_id: string;
  title: string;
  body: string;
  status: PostStatus;
  moderation_status: ModerationStatus;
  created_at: string;
};

export type CommentRecord = {
  id: string;
  post_id: string;
  author_user_id: string;
  body: string;
  status: CommentStatus;
  moderation_status: ModerationStatus;
  created_at: string;
};

export type FollowRecord = {
  id: string;
  user_id: string;
  target_type: FollowTargetType;
  target_id: string;
  created_at: string;
};

export type DonationIntentRecord = {
  id: string;
  user_id: string;
  fundraiser_id: string;
  amount: number;
  status: DonationIntentStatus;
  created_at: string;
};

export type ReportRecord = {
  id: string;
  reporter_user_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  status: ReportStatus;
  created_at: string;
};
