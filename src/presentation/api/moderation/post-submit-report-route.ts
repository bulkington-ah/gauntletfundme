import { sessionTokenHeader } from "../auth/session-header";
import { getApplicationApi } from "../application-api";
import { jsonResponse, parseJsonBody } from "../http";

type SubmitReportBody = {
  targetType?: string;
  targetId?: string;
  reason?: string;
};

export const handlePostSubmitReportRoute = async (
  request: Request,
): Promise<Response> => {
  const body = await parseJsonBody<SubmitReportBody>(request);

  if (!body?.targetType || !body.targetId || !body.reason) {
    return jsonResponse(
      {
        error: "invalid_request",
        message: "targetType, targetId, and reason are required.",
      },
      400,
    );
  }

  const result = await getApplicationApi().submitReport({
    sessionToken: request.headers.get(sessionTokenHeader),
    targetType: body.targetType,
    targetId: body.targetId,
    reason: body.reason,
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
          report: result.report,
          created: result.created,
          meta: {
            sessionTokenHeader,
          },
        },
        result.created ? 201 : 200,
      );
  }
};
