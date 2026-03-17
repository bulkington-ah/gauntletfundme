import { sessionTokenHeader } from "../auth/session-header";
import { getApplicationApi } from "../application-api";
import { jsonResponse, parseJsonBody } from "../http";

type CreateCommentBody = {
  postId?: string;
  body?: string;
};

export const handlePostCreateCommentRoute = async (
  request: Request,
): Promise<Response> => {
  const body = await parseJsonBody<CreateCommentBody>(request);

  if (!body?.postId || !body.body) {
    return jsonResponse(
      {
        error: "invalid_request",
        message: "postId and body are required.",
      },
      400,
    );
  }

  const result = await getApplicationApi().createComment({
    sessionToken: request.headers.get(sessionTokenHeader),
    postId: body.postId,
    body: body.body,
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
          comment: result.comment,
          meta: {
            sessionTokenHeader,
          },
        },
        201,
      );
  }
};
