import type { SessionViewerGateway } from "@/application/engagement";
import type { Community } from "@/domain";

export type CommunitySlugReference = {
  id: string;
  slug: string;
};

export interface CommunityWriteRepository {
  findCommunityBySlugForCreation(
    communitySlug: string,
  ): Promise<CommunitySlugReference | null>;
  createCommunity(input: {
    ownerUserId: string;
    slug: string;
    name: string;
    description: string;
    visibility: "public";
  }): Promise<Community>;
}

export interface ViewerOwnedCommunityQuery {
  listOwnedCommunitiesByOwnerUserId(ownerUserId: string): Promise<Community[]>;
}

export type CommunitySessionViewerGateway = SessionViewerGateway;
