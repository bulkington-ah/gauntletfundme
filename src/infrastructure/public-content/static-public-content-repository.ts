import type {
  FollowTargetLookup,
  FollowTargetReference,
} from "@/application/engagement";
import type {
  PublicActorSnapshot,
  CommunityDiscussionSnapshot,
  PublicCommunitySnapshot,
  PublicCommunitySummarySnapshot,
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

  const findDonationsForFundraiser = (fundraiserId: string) =>
    catalog.donations
      .filter((donation) => donation.fundraiserId === fundraiserId)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());

  const listFundraiserSummaries = (): PublicFundraiserSummarySnapshot[] =>
    catalog.fundraisers.flatMap((fundraiser) => {
      const summary = buildFundraiserSummarySnapshot(fundraiser.id);

      return summary ? [summary] : [];
    });

  const buildCommunitySummarySnapshot = (
    communityId: string,
  ): PublicCommunitySummarySnapshot | null => {
    const community =
      catalog.communities.find((entry) => entry.id === communityId) ?? null;

    if (!community) {
      return null;
    }

    const owner = findUserById(community.ownerUserId);

    if (!owner) {
      return null;
    }

    return {
      community,
      owner,
      ownerProfile: findUserProfileByUserId(owner.id),
      followerCount: countFollowers("community", community.id),
      fundraiserCount: findFundraisersByOwnerUserId(community.ownerUserId).length,
    };
  };

  const listCommunitySummaries = (): PublicCommunitySummarySnapshot[] =>
    catalog.communities.flatMap((community) => {
      const summary = buildCommunitySummarySnapshot(community.id);

      return summary ? [summary] : [];
    });

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

    const donations = findDonationsForFundraiser(fundraiser.id);

    return {
      fundraiser,
      owner,
      ownerProfile: findUserProfileByUserId(owner.id),
      relatedCommunity: findCommunitiesByOwnerUserId(owner.id)[0] ?? null,
      donationCount: donations.length,
      supporterCount: new Set(donations.map((donation) => donation.userId)).size,
      amountRaised: donations.reduce((sum, donation) => sum + donation.amount, 0),
    };
  };

  const compareFundraiserSummaries = (
    left: PublicFundraiserSummarySnapshot,
    right: PublicFundraiserSummarySnapshot,
  ): number => {
    if (right.amountRaised !== left.amountRaised) {
      return right.amountRaised - left.amountRaised;
    }

    if (right.donationCount !== left.donationCount) {
      return right.donationCount - left.donationCount;
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
      findDonationsForFundraiser(fundraiserSummary.fundraiser.id).flatMap(
        (donation) => {
          const actor = buildActorSnapshotByUserId(donation.userId);

          return actor
            ? [
                {
                  type: "fundraiser_donation" as const,
                  actor,
                  fundraiser: fundraiserSummary,
                  community: fundraiserSummary.relatedCommunity,
                  donation,
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
          left.type === "fundraiser_donation"
            ? left.donation.createdAt
            : left.post.createdAt;
        const rightCreatedAt =
          right.type === "fundraiser_donation"
            ? right.donation.createdAt
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
      findDonationsForFundraiser(fundraiserSummary.fundraiser.id).forEach(
        (donation) => {
          if (donation.userId !== ownerUserId) {
            engagedUserIds.add(donation.userId);
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
    async listFundraisers(): Promise<PublicFundraiserSummarySnapshot[]> {
      return listFundraiserSummaries();
    },
    async listCommunities(): Promise<PublicCommunitySummarySnapshot[]> {
      return listCommunitySummaries();
    },
    async findProfileSlugByUserId(userId: string): Promise<string | null> {
      return findUserProfileByUserId(userId)?.slug ?? null;
    },
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
        recentDonations: findDonationsForFundraiser(fundraiser.id).flatMap(
          (donation) => {
            const actor = buildActorSnapshotByUserId(donation.userId);

            return actor ? [{ actor, donation }] : [];
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
        amountRaised: fundraisers.reduce(
          (sum, fundraiserSummary) => sum + fundraiserSummary.amountRaised,
          0,
        ),
        donationCount: fundraisers.reduce(
          (sum, fundraiserSummary) => sum + fundraiserSummary.donationCount,
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
