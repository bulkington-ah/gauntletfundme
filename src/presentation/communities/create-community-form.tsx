"use client";

import { startTransition, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import styles from "./create-community-page.module.css";

type CreateCommunityResponseBody = {
  community?: {
    slug: string;
  };
  message?: string;
};

type CreateCommunityFormProps = {
  nextPath: string;
};

export function CreateCommunityForm({
  nextPath,
}: CreateCommunityFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !description.trim()) {
      setErrorMessage("Name and description are required.");
      return;
    }

    setIsPending(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/communities", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
        }),
      });
      const responseBody = (await response
        .json()
        .catch(() => null)) as CreateCommunityResponseBody | null;

      if (!response.ok) {
        if (response.status === 401) {
          router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
          return;
        }

        setErrorMessage(
          responseBody?.message ??
            "We couldn't create your community right now. Please try again.",
        );
        return;
      }

      const communitySlug = responseBody?.community?.slug;

      if (!communitySlug) {
        setErrorMessage(
          "We created the community but couldn't resolve the destination page.",
        );
        return;
      }

      startTransition(() => {
        router.replace(`/communities/${communitySlug}`);
      });
    } catch {
      setErrorMessage(
        "We couldn't create your community right now. Please try again.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Community name</span>
        <input
          className={styles.input}
          name="name"
          onChange={(event) => setName(event.target.value)}
          placeholder="Neighborhood Mutual Aid"
          type="text"
          value={name}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Description</span>
        <textarea
          className={styles.textarea}
          name="description"
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Share what this community is organizing, who it supports, and how people can stay involved."
          rows={6}
          value={description}
        />
      </label>

      <p className={styles.helperText}>
        New communities are created as public right away so supporters can find
        them from the browse page immediately.
      </p>

      {errorMessage ? (
        <p className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className={styles.actions}>
        <button className={styles.submitButton} disabled={isPending} type="submit">
          {isPending ? "Creating..." : "Create community"}
        </button>
        <Link className={styles.secondaryLink} href="/communities">
          Back to communities
        </Link>
      </div>
    </form>
  );
}
