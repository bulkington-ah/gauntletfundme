import { randomUUID } from "node:crypto";

import { DomainValidationError, createUser, normalizeEmail, userRoles } from "@/domain";

import type { SignUpRequest, SignUpResult } from "./contracts";
import type { AccountAuthRepository } from "./ports";

type Dependencies = {
  accountAuthRepository: AccountAuthRepository;
};

export const signUp = async (
  dependencies: Dependencies,
  request: SignUpRequest,
): Promise<SignUpResult> => {
  const validationError = validateSignUpRequest(request);

  if (validationError) {
    return validationError;
  }

  const normalizedEmail = normalizeEmail(request.email);
  const existingUser = await dependencies.accountAuthRepository.findUserByEmail(
    normalizedEmail,
  );

  if (existingUser) {
    return {
      status: "conflict",
      message: `An account already exists for email "${normalizedEmail}".`,
    };
  }

  const role = (request.role ?? "supporter") as (typeof userRoles)[number];
  const user = createUser({
    id: `user_${randomUUID()}`,
    email: normalizedEmail,
    displayName: request.displayName,
    role,
    createdAt: new Date(),
  });

  await dependencies.accountAuthRepository.saveUser(user);
  await dependencies.accountAuthRepository.setPasswordCredential(
    user.id,
    request.password,
  );
  const sessionToken = await dependencies.accountAuthRepository.createSession(user.id);

  return {
    status: "success",
    sessionToken,
    viewer: {
      userId: user.id,
      role: user.role,
    },
  };
};

const validateSignUpRequest = (request: SignUpRequest): SignUpResult | null => {
  try {
    normalizeEmail(request.email);
  } catch (error) {
    if (error instanceof DomainValidationError) {
      return {
        status: "invalid_request",
        message: error.message,
      };
    }

    throw error;
  }

  if (!request.displayName?.trim()) {
    return {
      status: "invalid_request",
      message: "displayName is required.",
    };
  }

  if (!request.password?.trim()) {
    return {
      status: "invalid_request",
      message: "password is required.",
    };
  }

  if (request.password.trim().length < 8) {
    return {
      status: "invalid_request",
      message: "password must be at least 8 characters.",
    };
  }

  if (request.role && !userRoles.includes(request.role as (typeof userRoles)[number])) {
    return {
      status: "invalid_request",
      message: `role must be one of: ${userRoles.join(", ")}.`,
    };
  }

  return null;
};
