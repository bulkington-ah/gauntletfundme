import { readSessionTokenFromRequest } from "@/presentation/auth";

import { sessionTokenHeader } from "../auth/session-header";
import { getApplicationApi } from "../application-api";
import { jsonResponse, parseJsonBody } from "../http";

type CreateCommunityBody = {
  name?: string;
  description?: string;
};

export const handlePostCreateCommunityRoute = async (
  request: Request,
): Promise<Response> => {
  const body = await parseJsonBody<CreateCommunityBody>(request);

  if (
    typeof body?.name !== "string" ||
    typeof body?.description !== "string"
  ) {
    return jsonResponse(
      {
        error: "invalid_request",
        message: "name and description are required.",
      },
      400,
    );
  }

  const result = await getApplicationApi().createCommunity({
    sessionToken: readSessionTokenFromRequest(request),
    name: body.name,
    description: body.description,
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
    case "conflict":
      return jsonResponse({ error: result.status, message: result.message }, 409);
    case "success":
      return jsonResponse(
        {
          viewer: result.viewer,
          community: result.community,
          meta: {
            sessionTokenHeader,
          },
        },
        201,
      );
  }
};
