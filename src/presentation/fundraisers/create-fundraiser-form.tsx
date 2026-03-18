"use client";

import { startTransition, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { ViewerOwnedCommunitySummary } from "@/application";

import styles from "./create-fundraiser-page.module.css";

type CreateFundraiserResponseBody = {
  fundraiser?: {
    slug: string;
  };
  message?: string;
};

type CreateFundraiserFormProps = {
  communities: ViewerOwnedCommunitySummary[];
  nextPath: string;
};

export function CreateFundraiserForm({
  communities,
  nextPath,
}: CreateFundraiserFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [communitySlug, setCommunitySlug] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedGoalAmount = Number(goalAmount);

    if (!title.trim() || !story.trim() || !Number.isInteger(parsedGoalAmount)) {
      setErrorMessage(
        "Title, story, and a whole-dollar goal amount are required.",
      );
      return;
    }

    setIsPending(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/fundraisers", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title,
          story,
          goalAmount: parsedGoalAmount,
          communitySlug,
        }),
      });
      const responseBody = (await response
        .json()
        .catch(() => null)) as CreateFundraiserResponseBody | null;

      if (!response.ok) {
        if (response.status === 401) {
          router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
          return;
        }

        setErrorMessage(
          responseBody?.message ??
            "We couldn't create your fundraiser right now. Please try again.",
        );
        return;
      }

      const fundraiserSlug = responseBody?.fundraiser?.slug;

      if (!fundraiserSlug) {
        setErrorMessage(
          "We created the fundraiser but couldn't resolve the destination page.",
        );
        return;
      }

      startTransition(() => {
        router.replace(`/fundraisers/${fundraiserSlug}`);
      });
    } catch {
      setErrorMessage(
        "We couldn't create your fundraiser right now. Please try again.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Fundraiser title</span>
        <input
          className={styles.input}
          name="title"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Meals for the weekend pantry"
          type="text"
          value={title}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Story</span>
        <textarea
          className={styles.textarea}
          name="story"
          onChange={(event) => setStory(event.target.value)}
          placeholder="Explain the need, what the money covers, and why supporters should join in now."
          rows={7}
          value={story}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Goal amount (USD)</span>
        <input
          className={styles.input}
          inputMode="numeric"
          min={1}
          name="goalAmount"
          onChange={(event) => setGoalAmount(event.target.value)}
          placeholder="25000"
          step={1}
          type="number"
          value={goalAmount}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Link to one of your communities</span>
        <select
          className={styles.select}
          name="communitySlug"
          onChange={(event) => setCommunitySlug(event.target.value)}
          value={communitySlug}
        >
          <option value="">No linked community</option>
          {communities.map((community) => (
            <option key={community.id} value={community.slug}>
              {community.name}
            </option>
          ))}
        </select>
      </label>

      <p className={styles.helperText}>
        New fundraisers are published as active immediately. Community linking is
        optional and limited to communities you already own.
      </p>

      {errorMessage ? (
        <p className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className={styles.actions}>
        <button className={styles.submitButton} disabled={isPending} type="submit">
          {isPending ? "Creating..." : "Create fundraiser"}
        </button>
        <Link className={styles.secondaryLink} href="/fundraisers">
          Back to fundraisers
        </Link>
      </div>
    </form>
  );
}
