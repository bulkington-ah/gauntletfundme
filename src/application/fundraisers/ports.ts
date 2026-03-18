import type { SessionViewerGateway } from "@/application/engagement";
import type { Fundraiser } from "@/domain";

export type FundraiserSlugReference = {
  id: string;
  slug: string;
};

export type FundraiserOwnedCommunityReference = {
  id: string;
  slug: string;
  name: string;
};

export interface FundraiserWriteRepository {
  findFundraiserBySlugForCreation(
    fundraiserSlug: string,
  ): Promise<FundraiserSlugReference | null>;
  createFundraiser(input: {
    ownerUserId: string;
    communityId?: string | null;
    slug: string;
    title: string;
    story: string;
    status: "active";
    goalAmount: number;
  }): Promise<Fundraiser>;
}

export interface FundraiserCommunityOwnershipLookup {
  findOwnedCommunityBySlugForFundraiser(
    ownerUserId: string,
    communitySlug: string,
  ): Promise<FundraiserOwnedCommunityReference | null>;
}

export type FundraiserSessionViewerGateway = SessionViewerGateway;
