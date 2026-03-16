import {
  requireDate,
  requireNonEmptyString,
  requirePositiveInteger,
} from "@/domain/shared";

export const donationIntentStatuses = [
  "started",
  "abandoned",
  "completed",
] as const;

export type DonationIntentStatus = (typeof donationIntentStatuses)[number];

export type DonationIntent = {
  id: string;
  userId: string;
  fundraiserId: string;
  amount: number;
  status: DonationIntentStatus;
  createdAt: Date;
};

export type CreateDonationIntentInput = DonationIntent;

export const createDonationIntent = (
  input: CreateDonationIntentInput,
): DonationIntent => ({
  id: requireNonEmptyString(input.id, "id"),
  userId: requireNonEmptyString(input.userId, "userId"),
  fundraiserId: requireNonEmptyString(input.fundraiserId, "fundraiserId"),
  amount: requirePositiveInteger(input.amount, "amount"),
  status: input.status,
  createdAt: requireDate(input.createdAt, "createdAt"),
});
