import { getApplicationApi } from "../application-api";
import { jsonResponse, parseJsonBody } from "../http";

type FollowTargetBody = {
  targetType?: string;
  targetSlug?: string;
};

const demoSessionHeader = "x-demo-session";

export const handlePostFollowTargetRoute = async (
  request: Request,
): Promise<Response> => {
  const body = await parseJsonBody<FollowTargetBody>(request);

  if (!body?.targetType || !body.targetSlug) {
    return jsonResponse(
      {
        error: "invalid_request",
        message: "targetType and targetSlug are required.",
      },
      400,
    );
  }

  const result = await getApplicationApi().followTarget({
    sessionToken: request.headers.get(demoSessionHeader),
    targetType: body.targetType,
    targetSlug: body.targetSlug,
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
            demoSessionHeader,
          },
        },
        401,
      );
    case "not_found":
      return jsonResponse({ error: result.status, message: result.message }, 404);
    case "forbidden":
      return jsonResponse({ error: result.status, message: result.message }, 403);
    case "success":
      return jsonResponse(
        {
          viewer: result.viewer,
          target: result.target,
          follow: {
            id: result.followId,
            created: result.created,
          },
          meta: {
            demoSessionHeader,
          },
        },
        result.created ? 201 : 200,
      );
  }
};
