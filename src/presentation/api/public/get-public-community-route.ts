import { applicationApi } from "../application-api";
import { jsonResponse } from "../http";

type SlugRouteContext = {
  slug: string;
};

export const handleGetPublicCommunityRoute = async (
  _request: Request,
  context: SlugRouteContext,
): Promise<Response> => {
  const result = await applicationApi.getPublicCommunityBySlug({
    slug: context.slug,
  });

  switch (result.status) {
    case "success":
      return jsonResponse(result.data, 200);
    case "invalid_request":
      return jsonResponse({ error: result.status, message: result.message }, 400);
    case "not_found":
      return jsonResponse({ error: result.status, message: result.message }, 404);
  }
};
