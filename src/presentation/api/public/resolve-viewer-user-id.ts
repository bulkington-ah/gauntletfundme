import type { ApplicationApi } from "@/application";
import { readSessionTokenFromRequest } from "@/presentation/auth";

export const resolveViewerUserIdFromRequest = async (
  request: Request,
  applicationApi: Pick<ApplicationApi, "getSession">,
): Promise<string | null> => {
  const sessionToken = readSessionTokenFromRequest(request);

  if (!sessionToken) {
    return null;
  }

  const result = await applicationApi.getSession({ sessionToken });

  return result.status === "success" ? result.viewer.userId : null;
};
