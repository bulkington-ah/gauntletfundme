import type { Follow, FollowTargetType, UserRole } from "@/domain";

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
