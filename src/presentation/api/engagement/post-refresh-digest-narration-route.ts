import { readSessionTokenFromRequest } from "@/presentation/auth";

import { sessionTokenHeader } from "../auth/session-header";
import { getApplicationApi } from "../application-api";
import { jsonResponse, parseJsonBody } from "../http";

type RefreshDigestNarrationBody = {
  windowStart?: string;
  windowEnd?: string;
};

export const handlePostRefreshDigestNarrationRoute = async (
  request: Request,
): Promise<Response> => {
  const body = await parseJsonBody<RefreshDigestNarrationBody>(request);

  if (!body?.windowStart) {
    return jsonResponse(
      {
        error: "invalid_request",
        message: "windowStart is required.",
      },
      400,
    );
  }

  if (!body.windowEnd) {
    return jsonResponse(
      {
        error: "invalid_request",
        message: "windowEnd is required.",
      },
      400,
    );
  }

  const result = await getApplicationApi().refreshSupporterDigestNarration({
    sessionToken: readSessionTokenFromRequest(request),
    windowStart: body.windowStart,
    windowEnd: body.windowEnd,
  });

  switch (result.status) {
    case "invalid_request":
      return jsonResponse({ error: result.status, message: result.message }, 400);
    case "unauthorized":
      return jsonResponse(
        {
          error: result.status,
          message: result.message,
          meta: {
            sessionTokenHeader,
          },
        },
        401,
      );
    case "success":
      return jsonResponse(
        {
          digest: result.digest,
          meta: {
            sessionTokenHeader,
          },
        },
        200,
      );
  }
};
