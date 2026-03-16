import {
  createComment,
  createCommunity,
  createDonationIntent,
  createFollow,
  createFundraiser,
  createPost,
  createReport,
  createUser,
  createUserProfile,
  type Comment,
  type Community,
  type DonationIntent,
  type Follow,
  type Fundraiser,
  type Post,
  type Report,
  type User,
  type UserProfile,
} from "@/domain";

export type PrototypeCatalog = {
  users: User[];
  userProfiles: UserProfile[];
  fundraisers: Fundraiser[];
  communities: Community[];
  posts: Post[];
  comments: Comment[];
  follows: Follow[];
  donationIntents: DonationIntent[];
  reports: Report[];
  demoSessions: Record<string, string>;
};

const organizerCreatedAt = new Date("2026-03-16T08:00:00.000Z");
const supporterCreatedAt = new Date("2026-03-16T08:05:00.000Z");
const moderatorCreatedAt = new Date("2026-03-16T08:10:00.000Z");
const fundraiserCreatedAt = new Date("2026-03-16T09:00:00.000Z");
const communityCreatedAt = new Date("2026-03-16T09:30:00.000Z");
const kickoffPostCreatedAt = new Date("2026-03-16T10:00:00.000Z");
const volunteerPostCreatedAt = new Date("2026-03-16T11:00:00.000Z");
const firstCommentCreatedAt = new Date("2026-03-16T10:15:00.000Z");
const secondCommentCreatedAt = new Date("2026-03-16T11:30:00.000Z");

const prototypeCatalog: PrototypeCatalog = {
  users: [
    createUser({
      id: "user_organizer_avery",
      email: "avery.organizer@example.com",
      displayName: "Avery Johnson",
      role: "organizer",
      createdAt: organizerCreatedAt,
    }),
    createUser({
      id: "user_supporter_jordan",
      email: "jordan.supporter@example.com",
      displayName: "Jordan Lee",
      role: "supporter",
      createdAt: supporterCreatedAt,
    }),
    createUser({
      id: "user_moderator_morgan",
      email: "morgan.moderator@example.com",
      displayName: "Morgan Patel",
      role: "moderator",
      createdAt: moderatorCreatedAt,
    }),
  ],
  userProfiles: [
    createUserProfile({
      id: "profile_avery",
      userId: "user_organizer_avery",
      slug: "avery-johnson",
      bio: "Organizer building long-term community support around food access.",
      avatarUrl: "https://example.com/avatars/avery.png",
      profileType: "organizer",
      createdAt: organizerCreatedAt,
    }),
    createUserProfile({
      id: "profile_jordan",
      userId: "user_supporter_jordan",
      slug: "jordan-lee",
      bio: "Supporter who follows local mutual aid and volunteer updates.",
      avatarUrl: "https://example.com/avatars/jordan.png",
      profileType: "supporter",
      createdAt: supporterCreatedAt,
    }),
    createUserProfile({
      id: "profile_morgan",
      userId: "user_moderator_morgan",
      slug: "morgan-patel",
      bio: "Moderator helping keep community discussion constructive.",
      avatarUrl: null,
      profileType: "supporter",
      createdAt: moderatorCreatedAt,
    }),
  ],
  fundraisers: [
    createFundraiser({
      id: "fundraiser_warm_meals_2026",
      ownerUserId: "user_organizer_avery",
      slug: "warm-meals-2026",
      title: "Warm Meals 2026",
      story:
        "Funding weekly hot meal deliveries and pantry restocks for families across the neighborhood.",
      status: "active",
      goalAmount: 250000,
      createdAt: fundraiserCreatedAt,
    }),
  ],
  communities: [
    createCommunity({
      id: "community_neighbors_helping_neighbors",
      ownerUserId: "user_organizer_avery",
      slug: "neighbors-helping-neighbors",
      name: "Neighbors Helping Neighbors",
      description:
        "A public space for organizer updates, volunteer coordination, and supporter questions.",
      visibility: "public",
      createdAt: communityCreatedAt,
    }),
  ],
  posts: [
    createPost({
      id: "post_kickoff_update",
      communityId: "community_neighbors_helping_neighbors",
      authorUserId: "user_organizer_avery",
      title: "Kitchen kickoff update",
      body: "The new kitchen schedule is live and our first meal prep day is Saturday.",
      status: "published",
      moderationStatus: "visible",
      createdAt: kickoffPostCreatedAt,
    }),
    createPost({
      id: "post_volunteer_reminder",
      communityId: "community_neighbors_helping_neighbors",
      authorUserId: "user_supporter_jordan",
      title: "Volunteer reminder",
      body: "Please bring reusable containers if you are joining the pantry packing shift.",
      status: "published",
      moderationStatus: "visible",
      createdAt: volunteerPostCreatedAt,
    }),
  ],
  comments: [
    createComment({
      id: "comment_first_shift",
      postId: "post_kickoff_update",
      authorUserId: "user_supporter_jordan",
      body: "I can help with prep and delivery on the first shift.",
      status: "published",
      moderationStatus: "visible",
      createdAt: firstCommentCreatedAt,
    }),
    createComment({
      id: "comment_container_followup",
      postId: "post_volunteer_reminder",
      authorUserId: "user_organizer_avery",
      body: "Thank you. We will also have extra containers available onsite.",
      status: "published",
      moderationStatus: "visible",
      createdAt: secondCommentCreatedAt,
    }),
  ],
  follows: [
    createFollow({
      id: "follow_profile_jordan_to_avery",
      userId: "user_supporter_jordan",
      targetType: "profile",
      targetId: "profile_avery",
      createdAt: new Date("2026-03-16T12:00:00.000Z"),
    }),
    createFollow({
      id: "follow_fundraiser_jordan_to_warm_meals",
      userId: "user_supporter_jordan",
      targetType: "fundraiser",
      targetId: "fundraiser_warm_meals_2026",
      createdAt: new Date("2026-03-16T12:05:00.000Z"),
    }),
    createFollow({
      id: "follow_community_jordan_to_neighbors",
      userId: "user_supporter_jordan",
      targetType: "community",
      targetId: "community_neighbors_helping_neighbors",
      createdAt: new Date("2026-03-16T12:10:00.000Z"),
    }),
  ],
  donationIntents: [
    createDonationIntent({
      id: "intent_jordan_warm_meals",
      userId: "user_supporter_jordan",
      fundraiserId: "fundraiser_warm_meals_2026",
      amount: 5000,
      status: "started",
      createdAt: new Date("2026-03-16T12:20:00.000Z"),
    }),
    createDonationIntent({
      id: "intent_morgan_warm_meals",
      userId: "user_moderator_morgan",
      fundraiserId: "fundraiser_warm_meals_2026",
      amount: 2500,
      status: "completed",
      createdAt: new Date("2026-03-16T12:25:00.000Z"),
    }),
  ],
  reports: [
    createReport({
      id: "report_placeholder",
      reporterUserId: "user_moderator_morgan",
      targetType: "comment",
      targetId: "comment_container_followup",
      reason: "Placeholder seeded moderation record for API wiring.",
      status: "dismissed",
      createdAt: new Date("2026-03-16T12:30:00.000Z"),
    }),
  ],
  demoSessions: {
    "demo-organizer-session": "user_organizer_avery",
    "demo-supporter-session": "user_supporter_jordan",
    "demo-moderator-session": "user_moderator_morgan",
  },
};

export const getPrototypeCatalog = (): PrototypeCatalog => prototypeCatalog;
