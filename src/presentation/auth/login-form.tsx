"use client";

import { startTransition, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import styles from "./login-page.module.css";

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({
  nextPath,
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    setIsPending(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const responseBody = await response
          .json()
          .catch(() => null) as { error?: string; message?: string } | null;

        if (
          response.status === 401 &&
          responseBody?.error === "unauthorized" &&
          responseBody.message
        ) {
          setErrorMessage(responseBody.message);
          return;
        }

        setErrorMessage("We couldn't sign you in right now. Please try again.");
        return;
      }

      startTransition(() => {
        router.replace(nextPath);
      });
    } catch {
      setErrorMessage("We couldn't sign you in right now. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Email</span>
        <input
          autoComplete="email"
          className={styles.input}
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          value={email}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Password</span>
        <input
          autoComplete="current-password"
          className={styles.input}
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          value={password}
        />
      </label>

      {errorMessage ? (
        <p className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      ) : null}

      <button className={styles.submitButton} disabled={isPending} type="submit">
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
