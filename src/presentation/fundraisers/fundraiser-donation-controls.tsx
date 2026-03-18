"use client";

import {
  startTransition,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { AuthenticatedViewer } from "@/application";

import styles from "./public-fundraiser-page.module.css";

const openDonationFormEventName = "gofundme_v2:open-donation-form";

type FundraiserDonationButtonProps = {
  className: string;
  children: string;
};

type FundraiserDonationFormProps = {
  fundraiserSlug: string;
  nextPath: string;
  viewer: AuthenticatedViewer | null;
  buttonClassName: string;
};

export function FundraiserDonationButton({
  className,
  children,
}: FundraiserDonationButtonProps) {
  return (
    <button className={className} onClick={openDonationForm} type="button">
      {children}
    </button>
  );
}

export function FundraiserDonationForm({
  fundraiserSlug,
  nextPath,
  viewer,
  buttonClassName,
}: FundraiserDonationFormProps) {
  const router = useRouter();
  const amountInputRef = useRef<HTMLInputElement | null>(null);
  const [amount, setAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [requiresLogin, setRequiresLogin] = useState(false);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      window.setTimeout(() => amountInputRef.current?.focus(), 0);
    };

    window.addEventListener(openDonationFormEventName, handleOpen);

    return () => {
      window.removeEventListener(openDonationFormEventName, handleOpen);
    };
  }, []);

  const handleOpenClick = () => {
    setIsOpen(true);
    window.setTimeout(() => amountInputRef.current?.focus(), 0);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedAmount = Number(amount);

    if (!Number.isInteger(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Enter a whole-dollar amount greater than zero.");
      setSuccessMessage(null);
      return;
    }

    if (!viewer) {
      setRequiresLogin(true);
      setErrorMessage("Sign in to complete this donation.");
      setSuccessMessage(null);
      return;
    }

    setIsPending(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setRequiresLogin(false);

    try {
      const response = await fetch("/api/engagement/donations", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          fundraiserSlug,
          amount: parsedAmount,
        }),
      });

      const responseBody = (await response
        .json()
        .catch(() => null)) as
        | {
            donation?: {
              amount: number;
            };
            message?: string;
          }
        | null;

      if (!response.ok) {
        if (response.status === 401) {
          setRequiresLogin(true);
        }

        setErrorMessage(
          responseBody?.message ??
            "We couldn't submit your donation right now. Please try again.",
        );
        return;
      }

      const submittedAmount = responseBody?.donation?.amount ?? parsedAmount;
      setAmount("");
      setSuccessMessage(
        `${formatCurrency(submittedAmount)} donated. Totals are refreshing now.`,
      );

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setErrorMessage("We couldn't submit your donation right now. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={styles.donationControl} data-donation-form-root="true">
      <button
        className={buttonClassName}
        disabled={isPending}
        onClick={handleOpenClick}
        type="button"
      >
        {isPending ? "Submitting..." : "Donate now"}
      </button>

      {isOpen ? (
        <form className={styles.donationForm} onSubmit={handleSubmit}>
          <label className={styles.donationField}>
            <span className={styles.donationLabel}>Donation amount (USD)</span>
            <input
              ref={amountInputRef}
              className={styles.donationInput}
              inputMode="numeric"
              min={1}
              name="amount"
              onChange={(event) => setAmount(event.target.value)}
              placeholder="250"
              step={1}
              type="number"
              value={amount}
            />
          </label>

          <p className={styles.donationHint}>
            Payment processing is mocked in v1, but submitted donations are saved
            and update the public totals.
          </p>

          {errorMessage ? (
            <p className={styles.donationError} role="alert">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className={styles.donationSuccess} role="status">
              {successMessage}
            </p>
          ) : null}

          {requiresLogin ? (
            <p className={styles.donationAuthHint}>
              <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>
                Sign in to donate
              </Link>
            </p>
          ) : null}

          <button
            className={styles.donationSubmitButton}
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Submitting..." : "Submit donation"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

const openDonationForm = () => {
  window.dispatchEvent(new CustomEvent(openDonationFormEventName));

  const visibleRoot = Array.from(
    document.querySelectorAll<HTMLElement>("[data-donation-form-root='true']"),
  ).find((element) => element.offsetParent !== null);

  visibleRoot?.scrollIntoView({ behavior: "smooth", block: "center" });
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
