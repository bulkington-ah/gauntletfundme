import type {
  FollowTargetLookup,
  FollowTargetReference,
} from "@/application/engagement";
import type {
  PublicActorSnapshot,
  CommunityDiscussionSnapshot,
  PublicCommunitySnapshot,
  PublicContentReadRepository,
  PublicFundraiserSnapshot,
  PublicFundraiserSummarySnapshot,
  PublicProfileSnapshot,
  PublicProfileActivitySnapshot,
} from "@/application/public-content";
import type {
  Comment,
  FollowTargetType,
  User,
  UserProfile,
} from "@/domain";
import { getPrototypeCatalog } from "@/infrastructure/demo-data";

export const createStaticPublicContentRepository = (): PublicContentReadRepository &
  FollowTargetLookup => {
  const catalog = getPrototypeCatalog();

  const findUserById = (userId: string): User | null =>
    catalog.users.find((user) => user.id === userId) ?? null;

  const findUserProfileByUserId = (userId: string): UserProfile | null =>
    catalog.userProfiles.find((profile) => profile.userId === userId) ?? null;

  const buildActorSnapshotByUserId = (
    userId: string,
  ): PublicActorSnapshot | null => {
    const user = findUserById(userId);

    if (!user) {
      return null;
    }

    return {
      user,
      profile: findUserProfileByUserId(userId),
    };
  };

  const findVisibleCommentsForPost = (
    postId: string,
  ): Array<{ comment: Comment; author: User }> =>
    catalog.comments
      .filter(
        (comment) =>
          comment.postId === postId && comment.moderationStatus === "visible",
      )
      .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime())
      .flatMap((comment) => {
        const author = findUserById(comment.authorUserId);

        return author ? [{ comment, author }] : [];
      });

  const findVisibleDiscussionForCommunity = (
    communityId: string,
  ): CommunityDiscussionSnapshot[] =>
    catalog.posts
      .filter(
        (post) =>
          post.communityId === communityId &&
          post.status === "published" &&
          post.moderationStatus === "visible",
      )
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .flatMap((post) => {
        const author = findUserById(post.authorUserId);

        return author
          ? [
              {
                post,
                author,
                comments: findVisibleCommentsForPost(post.id),
              },
            ]
          : [];
      });

  const findCommunitiesByOwnerUserId = (ownerUserId: string) =>
    catalog.communities
      .filter((community) => community.ownerUserId === ownerUserId)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());

  const findFundraisersByOwnerUserId = (ownerUserId: string) =>
    catalog.fundraisers
      .filter((fundraiser) => fundraiser.ownerUserId === ownerUserId)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());

  const findDonationIntentsForFundraiser = (fundraiserId: string) =>
    catalog.donationIntents
      .filter((intent) => intent.fundraiserId === fundraiserId)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());

  const countFollowers = (targetType: FollowTargetType, targetId: string): number =>
    catalog.follows.filter(
      (follow) => follow.targetType === targetType && follow.targetId === targetId,
    ).length;

  const countFollowing = (userId: string): number =>
    catalog.follows.filter((follow) => follow.userId === userId).length;

  const buildFundraiserSummarySnapshot = (
    fundraiserId: string,
  ): PublicFundraiserSummarySnapshot | null => {
    const fundraiser =
      catalog.fundraisers.find((entry) => entry.id === fundraiserId) ?? null;

    if (!fundraiser) {
      return null;
    }

    const owner = findUserById(fundraiser.ownerUserId);

    if (!owner) {
      return null;
    }

    const donationIntents = findDonationIntentsForFundraiser(fundraiser.id);

    return {
      fundraiser,
      owner,
      ownerProfile: findUserProfileByUserId(owner.id),
      relatedCommunity: findCommunitiesByOwnerUserId(owner.id)[0] ?? null,
      donationIntentCount: donationIntents.length,
      supporterCount: new Set(donationIntents.map((intent) => intent.userId)).size,
      supportAmount: donationIntents.reduce((sum, intent) => sum + intent.amount, 0),
    };
  };

  const compareFundraiserSummaries = (
    left: PublicFundraiserSummarySnapshot,
    right: PublicFundraiserSummarySnapshot,
  ): number => {
    if (right.supportAmount !== left.supportAmount) {
      return right.supportAmount - left.supportAmount;
    }

    if (right.donationIntentCount !== left.donationIntentCount) {
      return right.donationIntentCount - left.donationIntentCount;
    }

    return (
      right.fundraiser.createdAt.getTime() - left.fundraiser.createdAt.getTime()
    );
  };

  const findFundraiserSummariesByOwnerUserId = (
    ownerUserId: string,
  ): PublicFundraiserSummarySnapshot[] =>
    findFundraisersByOwnerUserId(ownerUserId)
      .flatMap((fundraiser) => {
        const summary = buildFundraiserSummarySnapshot(fundraiser.id);

        return summary ? [summary] : [];
      })
      .sort(compareFundraiserSummaries);

  const buildProfileRecentActivity = (
    ownerUserId: string,
    fundraiserSummaries: PublicFundraiserSummarySnapshot[],
    ownedCommunities: ReturnType<typeof findCommunitiesByOwnerUserId>,
  ): PublicProfileActivitySnapshot[] => {
    const donationActivity = fundraiserSummaries.flatMap((fundraiserSummary) =>
      findDonationIntentsForFundraiser(fundraiserSummary.fundraiser.id).flatMap(
        (donationIntent) => {
          const actor = buildActorSnapshotByUserId(donationIntent.userId);

          return actor
            ? [
                {
                  type: "fundraiser_support" as const,
                  actor,
                  fundraiser: fundraiserSummary,
                  community: fundraiserSummary.relatedCommunity,
                  donationIntent,
                },
              ]
            : [];
        },
      ),
    );

    const communityPostActivity = ownedCommunities.flatMap((community) =>
      catalog.posts
        .filter(
          (post) =>
            post.communityId === community.id &&
            post.status === "published" &&
            post.moderationStatus === "visible",
        )
        .flatMap((post) => {
          const actor = buildActorSnapshotByUserId(post.authorUserId);

          return actor
            ? [
                {
                  type: "community_post" as const,
                  actor,
                  community,
                  post,
                },
              ]
            : [];
        }),
    );

    return [...donationActivity, ...communityPostActivity]
      .sort((left, right) => {
        const leftCreatedAt =
          left.type === "fundraiser_support"
            ? left.donationIntent.createdAt
            : left.post.createdAt;
        const rightCreatedAt =
          right.type === "fundraiser_support"
            ? right.donationIntent.createdAt
            : right.post.createdAt;

        return rightCreatedAt.getTime() - leftCreatedAt.getTime();
      })
      .slice(0, 8);
  };

  const countInspiredSupporters = (
    ownerUserId: string,
    fundraiserSummaries: PublicFundraiserSummarySnapshot[],
    ownedCommunities: ReturnType<typeof findCommunitiesByOwnerUserId>,
  ): number => {
    const engagedUserIds = new Set<string>();

    fundraiserSummaries.forEach((fundraiserSummary) => {
      findDonationIntentsForFundraiser(fundraiserSummary.fundraiser.id).forEach(
        (donationIntent) => {
          if (donationIntent.userId !== ownerUserId) {
            engagedUserIds.add(donationIntent.userId);
          }
        },
      );
    });

    ownedCommunities.forEach((community) => {
      const posts = catalog.posts.filter(
        (post) =>
          post.communityId === community.id &&
          post.status === "published" &&
          post.moderationStatus === "visible",
      );

      posts.forEach((post) => {
        if (post.authorUserId !== ownerUserId) {
          engagedUserIds.add(post.authorUserId);
        }

        catalog.comments
          .filter(
            (comment) =>
              comment.postId === post.id && comment.moderationStatus === "visible",
          )
          .forEach((comment) => {
            if (comment.authorUserId !== ownerUserId) {
              engagedUserIds.add(comment.authorUserId);
            }
          });
      });
    });

    return engagedUserIds.size;
  };

  return {
    async findProfileBySlug(slug: string): Promise<PublicProfileSnapshot | null> {
      const profile = catalog.userProfiles.find((entry) => entry.slug === slug);

      if (!profile) {
        return null;
      }

      const user = findUserById(profile.userId);

      if (!user) {
        return null;
      }

      const fundraiserSummaries = findFundraiserSummariesByOwnerUserId(user.id);
      const ownedCommunities = findCommunitiesByOwnerUserId(user.id);

      return {
        user,
        profile,
        followerCount: countFollowers("profile", profile.id),
        followingCount: countFollowing(user.id),
        inspiredSupporterCount: countInspiredSupporters(
          user.id,
          fundraiserSummaries,
          ownedCommunities,
        ),
        featuredFundraisers: fundraiserSummaries,
        ownedCommunities,
        recentActivity: buildProfileRecentActivity(
          user.id,
          fundraiserSummaries,
          ownedCommunities,
        ),
      };
    },
    async findFundraiserBySlug(
      slug: string,
    ): Promise<PublicFundraiserSnapshot | null> {
      const fundraiser = catalog.fundraisers.find((entry) => entry.slug === slug);

      if (!fundraiser) {
        return null;
      }

      const owner = findUserById(fundraiser.ownerUserId);

      if (!owner) {
        return null;
      }

      const summary = buildFundraiserSummarySnapshot(fundraiser.id);

      if (!summary) {
        return null;
      }

      return {
        summary,
        recentSupporters: findDonationIntentsForFundraiser(fundraiser.id).flatMap(
          (donationIntent) => {
            const actor = buildActorSnapshotByUserId(donationIntent.userId);

            return actor ? [{ actor, donationIntent }] : [];
          },
        ),
      };
    },
    async findCommunityBySlug(slug: string): Promise<PublicCommunitySnapshot | null> {
      const community = catalog.communities.find((entry) => entry.slug === slug);

      if (!community) {
        return null;
      }

      const owner = findUserById(community.ownerUserId);

      if (!owner) {
        return null;
      }

      const fundraisers = findFundraiserSummariesByOwnerUserId(community.ownerUserId);

      return {
        community,
        owner,
        ownerProfile: findUserProfileByUserId(owner.id),
        featuredFundraiser: fundraisers[0] ?? null,
        fundraisers,
        followerCount: countFollowers("community", community.id),
        supportAmount: fundraisers.reduce(
          (sum, fundraiserSummary) => sum + fundraiserSummary.supportAmount,
          0,
        ),
        donationIntentCount: fundraisers.reduce(
          (sum, fundraiserSummary) => sum + fundraiserSummary.donationIntentCount,
          0,
        ),
        discussion: findVisibleDiscussionForCommunity(community.id),
      };
    },
    async findTargetBySlug(
      targetType: FollowTargetType,
      slug: string,
    ): Promise<FollowTargetReference | null> {
      switch (targetType) {
        case "community":
          return toTargetReference(
            catalog.communities.find((community) => community.slug === slug) ?? null,
            targetType,
          );
        case "fundraiser":
          return toTargetReference(
            catalog.fundraisers.find((fundraiser) => fundraiser.slug === slug) ?? null,
            targetType,
          );
        case "profile":
          return toTargetReference(
            catalog.userProfiles.find((profile) => profile.slug === slug) ?? null,
            targetType,
          );
      }
    },
  };
};

const toTargetReference = (
  entry: { id: string; slug: string } | null,
  targetType: FollowTargetType,
): FollowTargetReference | null => {
  return entry
    ? {
        id: entry.id,
        slug: entry.slug,
        targetType,
      }
    : null;
};
