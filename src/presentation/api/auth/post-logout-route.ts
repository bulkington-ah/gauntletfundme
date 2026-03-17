import { getApplicationApi } from "../application-api";
import { jsonResponse } from "../http";

import { sessionTokenHeader } from "./session-header";

export const handlePostLogoutRoute = async (
  request: Request,
): Promise<Response> => {
  const result = await getApplicationApi().logout({
    sessionToken: request.headers.get(sessionTokenHeader),
  });

  switch (result.status) {
    case "invalid_request":
      return jsonResponse({ error: result.status, message: result.message }, 400);
    case "success":
      return jsonResponse(
        {
          message: result.message,
        },
        200,
      );
  }
};
