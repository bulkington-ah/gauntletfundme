"use client";

import { startTransition, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type {
  AuthenticatedViewer,
  PublicCommunityResponse,
} from "@/application";

import styles from "./public-community-page.module.css";

type CommunityActivityPanelProps = {
  communitySlug: string;
  discussion: PublicCommunityResponse["discussion"];
  viewer: AuthenticatedViewer | null;
  canCreatePost: boolean;
  nextPath: string;
};

type DiscussionResponseBody = {
  message?: string;
};

export function CommunityActivityPanel({
  communitySlug,
  discussion,
  viewer,
  canCreatePost,
  nextPath,
}: CommunityActivityPanelProps) {
  const router = useRouter();
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [postErrorMessage, setPostErrorMessage] = useState<string | null>(null);
  const [postSuccessMessage, setPostSuccessMessage] = useState<string | null>(null);
  const [isPostPending, setIsPostPending] = useState(false);
  const [commentBodies, setCommentBodies] = useState<Record<string, string>>({});
  const [commentErrorMessages, setCommentErrorMessages] = useState<
    Record<string, string | null>
  >({});
  const [commentSuccessMessages, setCommentSuccessMessages] = useState<
    Record<string, string | null>
  >({});
  const [commentPendingState, setCommentPendingState] = useState<
    Record<string, boolean>
  >({});

  const redirectToLogin = () => {
    router.push(`/login?next=${encodeURIComponent(nextPath)}`);
  };

  const handleCreatePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = postTitle.trim();
    const trimmedBody = postBody.trim();

    if (!trimmedTitle || !trimmedBody) {
      setPostErrorMessage("Update title and details are required.");
      setPostSuccessMessage(null);
      return;
    }

    if (!viewer) {
      redirectToLogin();
      return;
    }

    setIsPostPending(true);
    setPostErrorMessage(null);
    setPostSuccessMessage(null);

    try {
      const response = await fetch("/api/discussion/posts", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          communitySlug,
          title: trimmedTitle,
          body: trimmedBody,
        }),
      });

      const responseBody = (await response
        .json()
        .catch(() => null)) as DiscussionResponseBody | null;

      if (!response.ok) {
        if (response.status === 401) {
          redirectToLogin();
          return;
        }

        setPostErrorMessage(
          responseBody?.message ??
            "We couldn't post this update right now. Please try again.",
        );
        return;
      }

      setPostTitle("");
      setPostBody("");
      setPostSuccessMessage("Update posted. Refreshing activity.");

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setPostErrorMessage(
        "We couldn't post this update right now. Please try again.",
      );
    } finally {
      setIsPostPending(false);
    }
  };

  const handleCommentSubmit =
    (postId: string) => async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const trimmedBody = (commentBodies[postId] ?? "").trim();

      if (!trimmedBody) {
        setCommentErrorMessages((current) => ({
          ...current,
          [postId]: "Comment details are required.",
        }));
        setCommentSuccessMessages((current) => ({
          ...current,
          [postId]: null,
        }));
        return;
      }

      if (!viewer) {
        redirectToLogin();
        return;
      }

      setCommentPendingState((current) => ({
        ...current,
        [postId]: true,
      }));
      setCommentErrorMessages((current) => ({
        ...current,
        [postId]: null,
      }));
      setCommentSuccessMessages((current) => ({
        ...current,
        [postId]: null,
      }));

      try {
        const response = await fetch("/api/discussion/comments", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            postId,
            body: trimmedBody,
          }),
        });

        const responseBody = (await response
          .json()
          .catch(() => null)) as DiscussionResponseBody | null;

        if (!response.ok) {
          if (response.status === 401) {
            redirectToLogin();
            return;
          }

          setCommentErrorMessages((current) => ({
            ...current,
            [postId]:
              responseBody?.message ??
              "We couldn't post this comment right now. Please try again.",
          }));
          return;
        }

        setCommentBodies((current) => ({
          ...current,
          [postId]: "",
        }));
        setCommentSuccessMessages((current) => ({
          ...current,
          [postId]: "Comment posted. Refreshing activity.",
        }));

        startTransition(() => {
          router.refresh();
        });
      } catch {
        setCommentErrorMessages((current) => ({
          ...current,
          [postId]: "We couldn't post this comment right now. Please try again.",
        }));
      } finally {
        setCommentPendingState((current) => ({
          ...current,
          [postId]: false,
        }));
      }
    };

  return (
    <>
      <div className={styles.activityHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Activity</p>
          <h2 className={styles.panelTitle}>Community updates</h2>
        </div>
      </div>

      {canCreatePost ? (
        <section className={styles.composerCard}>
          <div className={styles.composerHeader}>
            <div>
              <p className={styles.composerEyebrow}>Post an update</p>
              <h3 className={styles.composerTitle}>Share the latest with your community</h3>
            </div>
          </div>

          <form className={styles.composerForm} onSubmit={handleCreatePost}>
            <label className={styles.formField}>
              <span className={styles.formLabel}>Update title</span>
              <input
                className={styles.textInput}
                name="title"
                onChange={(event) => {
                  setPostTitle(event.target.value);
                  setPostErrorMessage(null);
                  setPostSuccessMessage(null);
                }}
                placeholder="Volunteer shift reminder"
                type="text"
                value={postTitle}
              />
            </label>

            <label className={styles.formField}>
              <span className={styles.formLabel}>Update details</span>
              <textarea
                className={styles.textareaInput}
                name="body"
                onChange={(event) => {
                  setPostBody(event.target.value);
                  setPostErrorMessage(null);
                  setPostSuccessMessage(null);
                }}
                placeholder="Share the latest update, request, or next step for supporters."
                rows={4}
                value={postBody}
              />
            </label>

            {postErrorMessage ? (
              <p className={styles.formError} role="alert">
                {postErrorMessage}
              </p>
            ) : null}

            {postSuccessMessage ? (
              <p className={styles.formSuccess} role="status">
                {postSuccessMessage}
              </p>
            ) : null}

            <div className={styles.formActions}>
              <button
                className={styles.primaryAction}
                disabled={isPostPending}
                type="submit"
              >
                {isPostPending ? "Posting..." : "Post update"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <div className={styles.activityFeed}>
        {discussion.length > 0 ? (
          discussion.map((post) => {
            const commentCountLabel =
              post.comments.length === 1 ? "1 comment" : `${post.comments.length} comments`;

            return (
              <article
                className={styles.postCard}
                id={`post-${post.id}`}
                key={post.id}
              >
                <div className={styles.postHeader}>
                  {post.authorProfileSlug ? (
                    <Link
                      className={styles.postIdentityLink}
                      href={`/profiles/${post.authorProfileSlug}`}
                    >
                      <div className={styles.postAvatar} aria-hidden="true">
                        {toInitials(post.authorDisplayName)}
                      </div>
                      <div className={styles.postMeta}>
                        <p className={styles.postAuthor}>{post.authorDisplayName}</p>
                        <p className={styles.postDate}>
                          {formatDate(post.createdAt)} ·{" "}
                          {toTitleCase(post.moderationStatus)}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <>
                      <div className={styles.postAvatar} aria-hidden="true">
                        {toInitials(post.authorDisplayName)}
                      </div>
                      <div className={styles.postMeta}>
                        <p className={styles.postAuthor}>{post.authorDisplayName}</p>
                        <p className={styles.postDate}>
                          {formatDate(post.createdAt)} ·{" "}
                          {toTitleCase(post.moderationStatus)}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className={styles.postContent}>
                  <h3 className={styles.postTitle}>{post.title}</h3>
                  <p className={styles.postBody}>{post.body}</p>
                </div>

                <div className={styles.commentThread}>
                  <p className={styles.commentHeading}>{commentCountLabel}</p>

                  {post.comments.length > 0 ? (
                    <ul className={styles.commentList}>
                      {post.comments.map((comment) => (
                        <li className={styles.commentItem} key={comment.id}>
                          <p className={styles.commentBody}>{comment.body}</p>
                          <p className={styles.commentMeta}>
                            {comment.authorProfileSlug ? (
                              <Link
                                className={styles.inlineAuthorLink}
                                href={`/profiles/${comment.authorProfileSlug}`}
                              >
                                {comment.authorDisplayName}
                              </Link>
                            ) : (
                              comment.authorDisplayName
                            )}{" "}
                            · {formatDate(comment.createdAt)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.emptyState}>No comments yet.</p>
                  )}

                  {viewer ? (
                    <form
                      className={styles.commentComposer}
                      onSubmit={handleCommentSubmit(post.id)}
                    >
                      <label className={styles.formField}>
                        <span className={styles.formLabel}>Add a comment</span>
                        <textarea
                          className={styles.commentTextarea}
                          name={`comment-${post.id}`}
                          onChange={(event) => {
                            setCommentBodies((current) => ({
                              ...current,
                              [post.id]: event.target.value,
                            }));
                            setCommentErrorMessages((current) => ({
                              ...current,
                              [post.id]: null,
                            }));
                            setCommentSuccessMessages((current) => ({
                              ...current,
                              [post.id]: null,
                            }));
                          }}
                          placeholder="Add a helpful update or response."
                          rows={3}
                          value={commentBodies[post.id] ?? ""}
                        />
                      </label>

                      {commentErrorMessages[post.id] ? (
                        <p className={styles.formError} role="alert">
                          {commentErrorMessages[post.id]}
                        </p>
                      ) : null}

                      {commentSuccessMessages[post.id] ? (
                        <p className={styles.formSuccess} role="status">
                          {commentSuccessMessages[post.id]}
                        </p>
                      ) : null}

                      <div className={styles.formActions}>
                        <button
                          className={styles.secondaryAction}
                          disabled={commentPendingState[post.id] === true}
                          type="submit"
                        >
                          {commentPendingState[post.id] === true
                            ? "Posting..."
                            : "Add comment"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className={styles.commentAuthHint}>
                      <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>
                        Sign in to comment
                      </Link>
                    </p>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          <p className={styles.emptyState}>No discussion posts yet.</p>
        )}
      </div>
    </>
  );
}

const toInitials = (value: string): string =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const toTitleCase = (value: string): string =>
  value
    .split("_")
    .flatMap((word) => word.split(" "))
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
