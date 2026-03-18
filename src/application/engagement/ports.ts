import type {
  Donation,
  Follow,
  FollowTargetType,
  UserRole,
} from "@/domain";

export type AuthenticatedViewer = {
  userId: string;
  role: UserRole;
};

export type FollowTargetReference = {
  id: string;
  slug: string;
  targetType: FollowTargetType;
};

export interface SessionViewerGateway {
  findViewerBySessionToken(
    sessionToken: string | null,
  ): Promise<AuthenticatedViewer | null>;
}

export interface FollowTargetLookup {
  findTargetBySlug(
    targetType: FollowTargetType,
    slug: string,
  ): Promise<FollowTargetReference | null>;
}

export type FollowOwnerLookup = {
  findOwnerUserIdByTarget(
    targetType: FollowTargetType,
    targetId: string,
  ): Promise<string | null>;
};

export type FollowWriteResult = {
  follow: Follow;
  created: boolean;
};

export interface FollowWriteRepository {
  createFollowIfAbsent(input: {
    userId: string;
    targetType: FollowTargetType;
    targetId: string;
  }): Promise<FollowWriteResult>;
  removeFollowIfPresent(input: {
    userId: string;
    targetType: FollowTargetType;
    targetId: string;
  }): Promise<{
    removed: boolean;
  }>;
  countFollowersForTarget(input: {
    targetType: FollowTargetType;
    targetId: string;
  }): Promise<number>;
}

export type DonationFundraiserReference = {
  id: string;
  slug: string;
};

export interface DonationTargetLookup {
  findFundraiserBySlugForDonation(
    fundraiserSlug: string,
  ): Promise<DonationFundraiserReference | null>;
}

export interface DonationWriteRepository {
  createDonation(input: {
    userId: string;
    fundraiserId: string;
    amount: number;
  }): Promise<Donation>;
}

export type DonationIntentFundraiserReference = DonationFundraiserReference;

export interface DonationIntentTargetLookup extends DonationTargetLookup {
  findFundraiserBySlugForDonationIntent?(
    fundraiserSlug: string,
  ): Promise<DonationIntentFundraiserReference | null>;
}

export interface DonationIntentWriteRepository extends DonationWriteRepository {
  createDonationIntent?(input: {
    userId: string;
    fundraiserId: string;
    amount: number;
  }): Promise<Donation>;
}
