import { readSessionTokenFromRequest } from "@/presentation/auth";

import { sessionTokenHeader } from "../auth/session-header";
import { getApplicationApi } from "../application-api";
import { jsonResponse, parseJsonBody } from "../http";

type RecordDigestViewBody = {
  viewedThrough?: string;
};

export const handlePostRecordDigestViewRoute = async (
  request: Request,
): Promise<Response> => {
  const body = await parseJsonBody<RecordDigestViewBody>(request);

  if (!body?.viewedThrough) {
    return jsonResponse(
      {
        error: "invalid_request",
        message: "viewedThrough is required.",
      },
      400,
    );
  }

  const result = await getApplicationApi().recordDigestView({
    sessionToken: readSessionTokenFromRequest(request),
    viewedThrough: body.viewedThrough,
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
          viewer: result.viewer,
          viewedThrough: result.viewedThrough,
          meta: {
            sessionTokenHeader,
          },
        },
        200,
      );
  }
};
