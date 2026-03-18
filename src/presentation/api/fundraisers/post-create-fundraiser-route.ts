import { readSessionTokenFromRequest } from "@/presentation/auth";

import { sessionTokenHeader } from "../auth/session-header";
import { getApplicationApi } from "../application-api";
import { jsonResponse, parseJsonBody } from "../http";

type CreateFundraiserBody = {
  title?: string;
  story?: string;
  goalAmount?: number;
  communitySlug?: string | null;
};

export const handlePostCreateFundraiserRoute = async (
  request: Request,
): Promise<Response> => {
  const body = await parseJsonBody<CreateFundraiserBody>(request);

  if (
    typeof body?.title !== "string" ||
    typeof body?.story !== "string" ||
    typeof body?.goalAmount !== "number" ||
    (body.communitySlug != null && typeof body.communitySlug !== "string")
  ) {
    return jsonResponse(
      {
        error: "invalid_request",
        message: "title, story, and goalAmount are required.",
      },
      400,
    );
  }

  const result = await getApplicationApi().createFundraiser({
    sessionToken: readSessionTokenFromRequest(request),
    title: body.title,
    story: body.story,
    goalAmount: body.goalAmount,
    communitySlug: body.communitySlug ?? null,
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
          fundraiser: result.fundraiser,
          community: result.community,
          meta: {
            sessionTokenHeader,
          },
        },
        201,
      );
  }
};
