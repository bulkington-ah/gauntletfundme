import { sessionTokenHeader } from "../auth/session-header";
import { getApplicationApi } from "../application-api";
import { jsonResponse, parseJsonBody } from "../http";

type CreatePostBody = {
  communitySlug?: string;
  title?: string;
  body?: string;
};

export const handlePostCreatePostRoute = async (
  request: Request,
): Promise<Response> => {
  const body = await parseJsonBody<CreatePostBody>(request);

  if (!body?.communitySlug || !body.title || !body.body) {
    return jsonResponse(
      {
        error: "invalid_request",
        message: "communitySlug, title, and body are required.",
      },
      400,
    );
  }

  const result = await getApplicationApi().createPost({
    sessionToken: request.headers.get(sessionTokenHeader),
    communitySlug: body.communitySlug,
    title: body.title,
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
          community: result.community,
          post: result.post,
          meta: {
            sessionTokenHeader,
          },
        },
        201,
      );
  }
};
