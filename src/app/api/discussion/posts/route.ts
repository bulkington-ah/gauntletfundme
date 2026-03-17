import { handlePostCreatePostRoute } from "@/presentation/api";

export const POST = async (request: Request): Promise<Response> =>
  handlePostCreatePostRoute(request);
