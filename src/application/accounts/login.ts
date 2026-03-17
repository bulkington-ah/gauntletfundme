import { DomainValidationError, normalizeEmail } from "@/domain";

import type { LoginRequest, LoginResult } from "./contracts";
import type { AccountAuthRepository } from "./ports";

type Dependencies = {
  accountAuthRepository: AccountAuthRepository;
};

export const login = async (
  dependencies: Dependencies,
  request: LoginRequest,
): Promise<LoginResult> => {
  const validationError = validateLoginRequest(request);

  if (validationError) {
    return validationError;
  }

  const normalizedEmail = normalizeEmail(request.email);
  const user = await dependencies.accountAuthRepository.findUserByEmail(
    normalizedEmail,
  );

  if (!user) {
    return {
      status: "unauthorized",
      message: "Invalid email or password.",
    };
  }

  const matchesPassword =
    await dependencies.accountAuthRepository.verifyPasswordCredential(
      user.id,
      request.password,
    );

  if (!matchesPassword) {
    return {
      status: "unauthorized",
      message: "Invalid email or password.",
    };
  }

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

const validateLoginRequest = (request: LoginRequest): LoginResult | null => {
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

  if (!request.password?.trim()) {
    return {
      status: "invalid_request",
      message: "password is required.",
    };
  }

  return null;
};
