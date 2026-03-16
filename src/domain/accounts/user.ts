import {
  normalizeEmail,
  requireDate,
  requireNonEmptyString,
} from "@/domain/shared";

export const userRoles = [
  "supporter",
  "organizer",
  "moderator",
  "admin",
] as const;

export type UserRole = (typeof userRoles)[number];

export type User = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Date;
};

export type CreateUserInput = User;

export const createUser = (input: CreateUserInput): User => ({
  id: requireNonEmptyString(input.id, "id"),
  email: normalizeEmail(input.email),
  displayName: requireNonEmptyString(input.displayName, "displayName"),
  role: input.role,
  createdAt: requireDate(input.createdAt, "createdAt"),
});
