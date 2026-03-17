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
const supporterSamCreatedAt = new Date("2026-03-16T08:06:00.000Z");
const supporterPriyaCreatedAt = new Date("2026-03-16T08:07:00.000Z");
const supporterElenaCreatedAt = new Date("2026-03-16T08:08:00.000Z");
const supporterNoahCreatedAt = new Date("2026-03-16T08:09:00.000Z");
const moderatorCreatedAt = new Date("2026-03-16T08:10:00.000Z");
const fundraiserCreatedAt = new Date("2026-03-16T09:00:00.000Z");
const winterCoatFundraiserCreatedAt = new Date("2026-03-16T09:10:00.000Z");
const schoolSuppliesFundraiserCreatedAt = new Date("2026-03-16T09:20:00.000Z");
const communityFridgeFundraiserCreatedAt = new Date("2026-03-16T09:25:00.000Z");
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
    createUser({
      id: "user_supporter_sam",
      email: "sam.supporter@example.com",
      displayName: "Sam Rivera",
      role: "supporter",
      createdAt: supporterSamCreatedAt,
    }),
    createUser({
      id: "user_supporter_priya",
      email: "priya.supporter@example.com",
      displayName: "Priya Shah",
      role: "supporter",
      createdAt: supporterPriyaCreatedAt,
    }),
    createUser({
      id: "user_supporter_elena",
      email: "elena.supporter@example.com",
      displayName: "Elena Gomez",
      role: "supporter",
      createdAt: supporterElenaCreatedAt,
    }),
    createUser({
      id: "user_supporter_noah",
      email: "noah.supporter@example.com",
      displayName: "Noah Kim",
      role: "supporter",
      createdAt: supporterNoahCreatedAt,
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
    createUserProfile({
      id: "profile_sam",
      userId: "user_supporter_sam",
      slug: "sam-rivera",
      bio: "Supporter who jumps in quickly when neighbors need supplies.",
      avatarUrl: "https://example.com/avatars/sam.png",
      profileType: "supporter",
      createdAt: supporterSamCreatedAt,
    }),
    createUserProfile({
      id: "profile_priya",
      userId: "user_supporter_priya",
      slug: "priya-shah",
      bio: "Supporter focused on school support and community meals.",
      avatarUrl: "https://example.com/avatars/priya.png",
      profileType: "supporter",
      createdAt: supporterPriyaCreatedAt,
    }),
    createUserProfile({
      id: "profile_elena",
      userId: "user_supporter_elena",
      slug: "elena-gomez",
      bio: "Supporter who shares local fundraisers and volunteer updates.",
      avatarUrl: "https://example.com/avatars/elena.png",
      profileType: "supporter",
      createdAt: supporterElenaCreatedAt,
    }),
    createUserProfile({
      id: "profile_noah",
      userId: "user_supporter_noah",
      slug: "noah-kim",
      bio: "Supporter helping with logistics, supplies, and neighborhood outreach.",
      avatarUrl: "https://example.com/avatars/noah.png",
      profileType: "supporter",
      createdAt: supporterNoahCreatedAt,
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
    createFundraiser({
      id: "fundraiser_winter_coat_drive_2026",
      ownerUserId: "user_organizer_avery",
      slug: "winter-coat-drive-2026",
      title: "Winter Coat Drive 2026",
      story:
        "Funding new coats, gloves, and cold-weather gear for neighbors preparing for severe weather.",
      status: "active",
      goalAmount: 180000,
      createdAt: winterCoatFundraiserCreatedAt,
    }),
    createFundraiser({
      id: "fundraiser_school_supplies_spring",
      ownerUserId: "user_organizer_avery",
      slug: "school-supplies-spring",
      title: "School Supplies Spring",
      story:
        "Building take-home supply kits for families preparing for the spring semester.",
      status: "active",
      goalAmount: 150000,
      createdAt: schoolSuppliesFundraiserCreatedAt,
    }),
    createFundraiser({
      id: "fundraiser_community_fridge_expansion",
      ownerUserId: "user_organizer_avery",
      slug: "community-fridge-expansion",
      title: "Community Fridge Expansion",
      story:
        "Adding storage, signage, and restock support for the neighborhood community fridge.",
      status: "active",
      goalAmount: 200000,
      createdAt: communityFridgeFundraiserCreatedAt,
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
      id: "follow_profile_morgan_to_avery",
      userId: "user_moderator_morgan",
      targetType: "profile",
      targetId: "profile_avery",
      createdAt: new Date("2026-03-16T12:02:00.000Z"),
    }),
    createFollow({
      id: "follow_profile_sam_to_avery",
      userId: "user_supporter_sam",
      targetType: "profile",
      targetId: "profile_avery",
      createdAt: new Date("2026-03-16T12:03:00.000Z"),
    }),
    createFollow({
      id: "follow_profile_priya_to_avery",
      userId: "user_supporter_priya",
      targetType: "profile",
      targetId: "profile_avery",
      createdAt: new Date("2026-03-16T12:04:00.000Z"),
    }),
    createFollow({
      id: "follow_profile_elena_to_avery",
      userId: "user_supporter_elena",
      targetType: "profile",
      targetId: "profile_avery",
      createdAt: new Date("2026-03-16T12:05:00.000Z"),
    }),
    createFollow({
      id: "follow_fundraiser_jordan_to_warm_meals",
      userId: "user_supporter_jordan",
      targetType: "fundraiser",
      targetId: "fundraiser_warm_meals_2026",
      createdAt: new Date("2026-03-16T12:06:00.000Z"),
    }),
    createFollow({
      id: "follow_fundraiser_sam_to_warm_meals",
      userId: "user_supporter_sam",
      targetType: "fundraiser",
      targetId: "fundraiser_warm_meals_2026",
      createdAt: new Date("2026-03-16T12:07:00.000Z"),
    }),
    createFollow({
      id: "follow_fundraiser_priya_to_winter_coat",
      userId: "user_supporter_priya",
      targetType: "fundraiser",
      targetId: "fundraiser_winter_coat_drive_2026",
      createdAt: new Date("2026-03-16T12:08:00.000Z"),
    }),
    createFollow({
      id: "follow_fundraiser_elena_to_fridge",
      userId: "user_supporter_elena",
      targetType: "fundraiser",
      targetId: "fundraiser_community_fridge_expansion",
      createdAt: new Date("2026-03-16T12:09:00.000Z"),
    }),
    createFollow({
      id: "follow_community_jordan_to_neighbors",
      userId: "user_supporter_jordan",
      targetType: "community",
      targetId: "community_neighbors_helping_neighbors",
      createdAt: new Date("2026-03-16T12:10:00.000Z"),
    }),
    createFollow({
      id: "follow_community_sam_to_neighbors",
      userId: "user_supporter_sam",
      targetType: "community",
      targetId: "community_neighbors_helping_neighbors",
      createdAt: new Date("2026-03-16T12:11:00.000Z"),
    }),
    createFollow({
      id: "follow_community_priya_to_neighbors",
      userId: "user_supporter_priya",
      targetType: "community",
      targetId: "community_neighbors_helping_neighbors",
      createdAt: new Date("2026-03-16T12:12:00.000Z"),
    }),
    createFollow({
      id: "follow_community_noah_to_neighbors",
      userId: "user_supporter_noah",
      targetType: "community",
      targetId: "community_neighbors_helping_neighbors",
      createdAt: new Date("2026-03-16T12:13:00.000Z"),
    }),
    createFollow({
      id: "follow_profile_avery_to_jordan",
      userId: "user_organizer_avery",
      targetType: "profile",
      targetId: "profile_jordan",
      createdAt: new Date("2026-03-16T11:50:00.000Z"),
    }),
    createFollow({
      id: "follow_profile_avery_to_morgan",
      userId: "user_organizer_avery",
      targetType: "profile",
      targetId: "profile_morgan",
      createdAt: new Date("2026-03-16T11:55:00.000Z"),
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
    createDonationIntent({
      id: "intent_elena_winter_coats",
      userId: "user_supporter_elena",
      fundraiserId: "fundraiser_winter_coat_drive_2026",
      amount: 6200,
      status: "completed",
      createdAt: new Date("2026-03-16T12:35:00.000Z"),
    }),
    createDonationIntent({
      id: "intent_sam_warm_meals",
      userId: "user_supporter_sam",
      fundraiserId: "fundraiser_warm_meals_2026",
      amount: 7500,
      status: "completed",
      createdAt: new Date("2026-03-16T12:40:00.000Z"),
    }),
    createDonationIntent({
      id: "intent_priya_warm_meals",
      userId: "user_supporter_priya",
      fundraiserId: "fundraiser_warm_meals_2026",
      amount: 3000,
      status: "started",
      createdAt: new Date("2026-03-16T12:45:00.000Z"),
    }),
    createDonationIntent({
      id: "intent_jordan_winter_coats",
      userId: "user_supporter_jordan",
      fundraiserId: "fundraiser_winter_coat_drive_2026",
      amount: 1800,
      status: "started",
      createdAt: new Date("2026-03-16T12:50:00.000Z"),
    }),
    createDonationIntent({
      id: "intent_noah_warm_meals",
      userId: "user_supporter_noah",
      fundraiserId: "fundraiser_warm_meals_2026",
      amount: 4000,
      status: "completed",
      createdAt: new Date("2026-03-16T12:55:00.000Z"),
    }),
    createDonationIntent({
      id: "intent_priya_school_supplies",
      userId: "user_supporter_priya",
      fundraiserId: "fundraiser_school_supplies_spring",
      amount: 5600,
      status: "completed",
      createdAt: new Date("2026-03-16T13:05:00.000Z"),
    }),
    createDonationIntent({
      id: "intent_morgan_school_supplies",
      userId: "user_moderator_morgan",
      fundraiserId: "fundraiser_school_supplies_spring",
      amount: 2400,
      status: "started",
      createdAt: new Date("2026-03-16T13:10:00.000Z"),
    }),
    createDonationIntent({
      id: "intent_noah_fridge_expansion",
      userId: "user_supporter_noah",
      fundraiserId: "fundraiser_community_fridge_expansion",
      amount: 9000,
      status: "completed",
      createdAt: new Date("2026-03-16T13:15:00.000Z"),
    }),
    createDonationIntent({
      id: "intent_elena_fridge_expansion",
      userId: "user_supporter_elena",
      fundraiserId: "fundraiser_community_fridge_expansion",
      amount: 3500,
      status: "started",
      createdAt: new Date("2026-03-16T13:20:00.000Z"),
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
