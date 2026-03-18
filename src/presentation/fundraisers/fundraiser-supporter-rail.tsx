"use client";

import { useId, useState } from "react";
import Link from "next/link";

import type { PublicFundraiserDonation } from "@/application";

import styles from "./public-fundraiser-page.module.css";

type FundraiserSupporterRailProps = {
  donations: PublicFundraiserDonation[];
};

type SupporterRailMode = "recent" | "all" | "top";

const defaultVisibleDonationCount = 3;

export function FundraiserSupporterRail({
  donations,
}: FundraiserSupporterRailProps) {
  const headingId = useId();
  const [mode, setMode] = useState<SupporterRailMode>("recent");
  const hasDonations = donations.length > 0;
  const visibleDonations = getVisibleDonations(donations, mode);
  const heading = mode === "top" ? "Top supporters" : "Recent supporters";

  return (
    <>
      <div className={styles.supportersHeader}>
        <h2 className={styles.supportersTitle} id={headingId}>
          {heading}
        </h2>
        <p className={styles.supportersCount}>{donations.length} public donations</p>
      </div>

      <div
        aria-labelledby={headingId}
        className={styles.supportersViewport}
        data-testid="fundraiser-supporter-viewport"
        role="region"
      >
        <ul className={styles.supportersList}>
          {visibleDonations.map((supporter) => (
            <SupporterListItem
              key={`${supporter.displayName}-${supporter.createdAt}-${supporter.amount}`}
              supporter={supporter}
            />
          ))}
        </ul>
      </div>

      <div className={styles.sidebarFooter}>
        <button
          aria-pressed={mode === "all"}
          className={`${styles.footerButton} ${mode === "all" ? styles.footerButtonActive : ""}`.trim()}
          disabled={!hasDonations}
          onClick={() => setMode((currentMode) => currentMode === "all" ? "recent" : "all")}
          type="button"
        >
          See all
        </button>
        <button
          aria-pressed={mode === "top"}
          className={`${styles.footerButton} ${mode === "top" ? styles.footerButtonActive : ""}`.trim()}
          disabled={!hasDonations}
          onClick={() => setMode((currentMode) => currentMode === "top" ? "recent" : "top")}
          type="button"
        >
          See top
        </button>
      </div>
    </>
  );
}

type SupporterListItemProps = {
  supporter: PublicFundraiserDonation;
};

const SupporterListItem = ({ supporter }: SupporterListItemProps) => (
  <li className={styles.supporterItem}>
    {supporter.profileSlug ? (
      <Link
        className={styles.supporterIdentityLink}
        href={`/profiles/${supporter.profileSlug}`}
      >
        <div className={styles.supporterAvatar} aria-hidden="true">
          {toInitials(supporter.displayName)}
        </div>

        <div className={styles.supporterDetails}>
          <div className={styles.supporterNameRow}>
            <span className={styles.supporterName}>{supporter.displayName}</span>
            <span className={styles.supporterDate}>
              {formatSupporterDate(supporter.createdAt)}
            </span>
          </div>
          <p className={styles.supporterMeta}>
            {formatCurrency(supporter.amount)} donated
          </p>
        </div>
      </Link>
    ) : (
      <>
        <div className={styles.supporterAvatar} aria-hidden="true">
          {toInitials(supporter.displayName)}
        </div>

        <div className={styles.supporterDetails}>
          <div className={styles.supporterNameRow}>
            <span className={styles.supporterName}>{supporter.displayName}</span>
            <span className={styles.supporterDate}>
              {formatSupporterDate(supporter.createdAt)}
            </span>
          </div>
          <p className={styles.supporterMeta}>
            {formatCurrency(supporter.amount)} donated
          </p>
        </div>
      </>
    )}
  </li>
);

const getVisibleDonations = (
  donations: PublicFundraiserDonation[],
  mode: SupporterRailMode,
): PublicFundraiserDonation[] => {
  if (mode === "top") {
    return [...donations].sort(compareDonationsByAmountThenDate);
  }

  if (mode === "all") {
    return donations;
  }

  return donations.slice(0, defaultVisibleDonationCount);
};

const compareDonationsByAmountThenDate = (
  left: PublicFundraiserDonation,
  right: PublicFundraiserDonation,
): number => {
  if (right.amount !== left.amount) {
    return right.amount - left.amount;
  }

  return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
};

const toInitials = (value: string): string =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const formatSupporterDate = (value: string): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
