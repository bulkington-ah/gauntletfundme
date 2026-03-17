import type { LogoutRequest, LogoutResult } from "./contracts";
import type { AccountAuthRepository } from "./ports";

type Dependencies = {
  accountAuthRepository: Pick<AccountAuthRepository, "invalidateSession">;
};

export const logout = async (
  dependencies: Dependencies,
  request: LogoutRequest,
): Promise<LogoutResult> => {
  if (!request.sessionToken) {
    return {
      status: "invalid_request",
      message: "A session token is required to logout.",
    };
  }

  await dependencies.accountAuthRepository.invalidateSession(request.sessionToken);

  return {
    status: "success",
    message: "Session ended.",
  };
};
