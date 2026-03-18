import { handlePostRefreshDigestNarrationRoute } from "@/presentation/api";

export const POST = async (request: Request): Promise<Response> =>
  handlePostRefreshDigestNarrationRoute(request);
