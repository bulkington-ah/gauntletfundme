import { getApplicationApi } from "../application-api";
import { jsonResponse } from "../http";
import {
  clearSessionCookieHeader,
  readSessionTokenFromRequest,
} from "@/presentation/auth";

export const handlePostLogoutRoute = async (
  request: Request,
): Promise<Response> => {
  const result = await getApplicationApi().logout({
    sessionToken: readSessionTokenFromRequest(request),
  });

  switch (result.status) {
    case "invalid_request":
      return jsonResponse({ error: result.status, message: result.message }, 400);
    case "success":
      return jsonResponse(
        {
          message: result.message,
        },
        {
          status: 200,
          headers: {
            "set-cookie": clearSessionCookieHeader(),
          },
        },
      );
  }
};
