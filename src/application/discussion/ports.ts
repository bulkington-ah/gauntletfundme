import type { SessionViewerGateway } from "@/application/engagement";
import type { Comment, Post } from "@/domain";

export type CommunityPostTarget = {
  id: string;
  slug: string;
  ownerUserId: string;
};

export type CommentPostTarget = {
  id: string;
};

export interface DiscussionTargetLookup {
  findCommunityBySlugForPostCreation(
    communitySlug: string,
  ): Promise<CommunityPostTarget | null>;
  findPostByIdForCommentCreation(postId: string): Promise<CommentPostTarget | null>;
}

export interface DiscussionWriteRepository {
  createPost(input: {
    communityId: string;
    authorUserId: string;
    title: string;
    body: string;
  }): Promise<Post>;
  createComment(input: {
    postId: string;
    authorUserId: string;
    body: string;
  }): Promise<Comment>;
}

export type DiscussionSessionViewerGateway = SessionViewerGateway;
