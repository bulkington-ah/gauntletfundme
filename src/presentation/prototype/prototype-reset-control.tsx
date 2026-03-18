"use client";

import { useState, type JSX } from "react";

import styles from "./prototype-reset-control.module.css";

type ResetResponse = {
  message?: string;
};

export function PrototypeResetControl(): JSX.Element {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    if (isPending) {
      return;
    }

    setIsPending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/prototype/reset", {
        method: "POST",
      });
      const responseBody = (await response
        .json()
        .catch(() => null)) as ResetResponse | null;

      if (!response.ok) {
        setErrorMessage(
          responseBody?.message ??
            "We couldn't reset the prototype data right now. Please try again.",
        );
        return;
      }

      setSuccessMessage(
        responseBody?.message ?? "Prototype data reset complete.",
      );
    } catch {
      setErrorMessage(
        "We couldn't reset the prototype data right now. Please try again.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={styles.control}>
      <button
        className={styles.button}
        disabled={isPending}
        onClick={handleClick}
        type="button"
      >
        {isPending ? "Resetting..." : "Reset prototype data"}
      </button>

      {successMessage ? (
        <p className={`${styles.message} ${styles.success}`} role="status">
          {successMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className={`${styles.message} ${styles.error}`} role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
