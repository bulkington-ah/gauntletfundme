import { getApplicationApi } from "../application-api";
import { jsonResponse } from "../http";
import { readSessionTokenFromRequest } from "@/presentation/auth";

export const handleGetSessionRoute = async (
  request: Request,
): Promise<Response> => {
  const result = await getApplicationApi().getSession({
    sessionToken: readSessionTokenFromRequest(request),
  });

  switch (result.status) {
    case "unauthorized":
      return jsonResponse({ error: result.status, message: result.message }, 401);
    case "success":
      return jsonResponse(
        {
          viewer: result.viewer,
        },
        200,
      );
  }
};
