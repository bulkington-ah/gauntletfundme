import { sessionTokenHeader } from "../auth/session-header";
import { getApplicationApi } from "../application-api";
import { jsonResponse, parseJsonBody } from "../http";

type UnfollowTargetBody = {
  targetType?: string;
  targetSlug?: string;
};

export const handlePostUnfollowTargetRoute = async (
  request: Request,
): Promise<Response> => {
  const body = await parseJsonBody<UnfollowTargetBody>(request);

  if (!body?.targetType || !body.targetSlug) {
    return jsonResponse(
      {
        error: "invalid_request",
        message: "targetType and targetSlug are required.",
      },
      400,
    );
  }

  const result = await getApplicationApi().unfollowTarget({
    sessionToken: request.headers.get(sessionTokenHeader),
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
            sessionTokenHeader,
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
            removed: result.removed,
            followerCount: result.followerCount,
            following: result.following,
          },
          meta: {
            sessionTokenHeader,
          },
        },
        200,
      );
  }
};
