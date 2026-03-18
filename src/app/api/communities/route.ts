import { handlePostCreateCommunityRoute } from "@/presentation/api";

export const POST = async (request: Request): Promise<Response> =>
  handlePostCreateCommunityRoute(request);
