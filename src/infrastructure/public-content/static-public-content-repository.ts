import type {
  FollowTargetLookup,
  FollowTargetReference,
} from "@/application/engagement";
import type {
  CommunityDiscussionSnapshot,
  PublicCommunitySnapshot,
  PublicContentReadRepository,
  PublicFundraiserSnapshot,
  PublicProfileSnapshot,
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

  const countFollowers = (targetType: FollowTargetType, targetId: string): number =>
    catalog.follows.filter(
      (follow) => follow.targetType === targetType && follow.targetId === targetId,
    ).length;

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

      return {
        user,
        profile,
        followerCount: countFollowers("profile", profile.id),
        featuredFundraisers: catalog.fundraisers.filter(
          (fundraiser) => fundraiser.ownerUserId === user.id,
        ),
        ownedCommunities: catalog.communities.filter(
          (community) => community.ownerUserId === user.id,
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

      return {
        fundraiser,
        owner,
        ownerProfile: findUserProfileByUserId(owner.id),
        relatedCommunity:
          catalog.communities.find(
            (community) => community.ownerUserId === fundraiser.ownerUserId,
          ) ?? null,
        donationIntentCount: catalog.donationIntents.filter(
          (intent) => intent.fundraiserId === fundraiser.id,
        ).length,
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

      return {
        community,
        owner,
        ownerProfile: findUserProfileByUserId(owner.id),
        featuredFundraiser:
          catalog.fundraisers.find(
            (fundraiser) => fundraiser.ownerUserId === community.ownerUserId,
          ) ?? null,
        followerCount: countFollowers("community", community.id),
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
