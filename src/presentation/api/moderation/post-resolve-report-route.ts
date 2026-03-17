import { readSessionTokenFromRequest } from "@/presentation/auth";

import { sessionTokenHeader } from "../auth/session-header";
import { getApplicationApi } from "../application-api";
import { jsonResponse, parseJsonBody } from "../http";

type ResolveReportBody = {
  reportId?: string;
  action?: string;
};

export const handlePostResolveReportRoute = async (
  request: Request,
): Promise<Response> => {
  const body = await parseJsonBody<ResolveReportBody>(request);

  if (!body?.reportId || !body.action) {
    return jsonResponse(
      {
        error: "invalid_request",
        message: "reportId and action are required.",
      },
      400,
    );
  }

  const result = await getApplicationApi().resolveReport({
    sessionToken: readSessionTokenFromRequest(request),
    reportId: body.reportId,
    action: body.action,
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
    case "forbidden":
      return jsonResponse({ error: result.status, message: result.message }, 403);
    case "not_found":
      return jsonResponse({ error: result.status, message: result.message }, 404);
    case "success":
      return jsonResponse(
        {
          viewer: result.viewer,
          resolution: result.resolution,
          target: result.target,
          meta: {
            sessionTokenHeader,
          },
        },
        200,
      );
  }
};
