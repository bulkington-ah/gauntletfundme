import { getApplicationApi } from "../application-api";
import { jsonResponse } from "../http";
import { resolveViewerUserIdFromRequest } from "./resolve-viewer-user-id";

type SlugRouteContext = {
  slug: string;
};

export const handleGetPublicFundraiserRoute = async (
  request: Request,
  context: SlugRouteContext,
): Promise<Response> => {
  const applicationApi = getApplicationApi();
  const viewerUserId = await resolveViewerUserIdFromRequest(request, applicationApi);
  const result = await applicationApi.getPublicFundraiserBySlug({
    slug: context.slug,
    viewerUserId,
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
