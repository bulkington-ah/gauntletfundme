import type { LookupSessionRequest, LookupSessionResult } from "./contracts";
import type { AccountAuthRepository } from "./ports";

type Dependencies = {
  accountAuthRepository: Pick<AccountAuthRepository, "findViewerBySessionToken">;
};

export const getSession = async (
  dependencies: Dependencies,
  request: LookupSessionRequest,
): Promise<LookupSessionResult> => {
  const viewer = await dependencies.accountAuthRepository.findViewerBySessionToken(
    request.sessionToken,
  );

  if (!viewer) {
    return {
      status: "unauthorized",
      message: "A valid session token is required.",
    };
  }

  return {
    status: "success",
    viewer,
  };
};
