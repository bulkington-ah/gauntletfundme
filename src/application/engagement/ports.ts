import type { FollowTargetType, UserRole } from "@/domain";

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
