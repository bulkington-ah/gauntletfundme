"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type {
  AuthenticatedViewer,
  ViewerFollowState,
} from "@/application";
import type { FollowTargetType } from "@/domain";

import styles from "./follow-target-control.module.css";

type FollowTargetControlProps = {
  buttonClassName: string;
  initialFollowState: ViewerFollowState | null;
  nextPath: string;
  targetSlug: string;
  targetType: FollowTargetType;
  viewer: AuthenticatedViewer | null;
};

type FollowTargetResponseBody = {
  follow?: {
    following?: boolean;
  };
  message?: string;
};

export function FollowTargetControl({
  buttonClassName,
  initialFollowState,
  nextPath,
  targetSlug,
  targetType,
  viewer,
}: FollowTargetControlProps) {
  const router = useRouter();
  const initialIsFollowing = initialFollowState?.isFollowing ?? false;
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
    setErrorMessage(null);
  }, [initialIsFollowing]);

  if (initialFollowState?.isOwnTarget) {
    return null;
  }

  const handleClick = async () => {
    if (isPending) {
      return;
    }

    if (!viewer) {
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    setIsPending(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        isFollowing ? "/api/engagement/unfollows" : "/api/engagement/follows",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            targetType,
            targetSlug,
          }),
        },
      );

      const responseBody = (await response
        .json()
        .catch(() => null)) as FollowTargetResponseBody | null;

      if (!response.ok) {
        if (response.status === 401) {
          router.push(`/login?next=${encodeURIComponent(nextPath)}`);
          return;
        }

        setErrorMessage(
          responseBody?.message ??
            "We couldn't update your follow state right now. Please try again.",
        );
        return;
      }

      if (typeof responseBody?.follow?.following === "boolean") {
        setIsFollowing(responseBody.follow.following);
      } else {
        setIsFollowing(!isFollowing);
      }

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setErrorMessage(
        "We couldn't update your follow state right now. Please try again.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={styles.control}>
      <button
        className={buttonClassName}
        disabled={isPending}
        onClick={handleClick}
        type="button"
      >
        {isPending ? "Updating..." : isFollowing ? "Unfollow" : "Follow"}
      </button>

      {errorMessage ? (
        <p className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
