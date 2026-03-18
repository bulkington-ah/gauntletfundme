import {
  requireDate,
  requireNonEmptyString,
  requirePositiveInteger,
} from "@/domain/shared";

export const donationStatuses = ["completed"] as const;

export type DonationStatus = (typeof donationStatuses)[number];

export type Donation = {
  id: string;
  userId: string;
  fundraiserId: string;
  amount: number;
  status: DonationStatus;
  createdAt: Date;
};

export type CreateDonationInput = Donation;

export const createDonation = (input: CreateDonationInput): Donation => ({
  id: requireNonEmptyString(input.id, "id"),
  userId: requireNonEmptyString(input.userId, "userId"),
  fundraiserId: requireNonEmptyString(input.fundraiserId, "fundraiserId"),
  amount: requirePositiveInteger(input.amount, "amount"),
  status: input.status,
  createdAt: requireDate(input.createdAt, "createdAt"),
});
