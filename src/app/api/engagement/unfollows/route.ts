import { handlePostUnfollowTargetRoute } from "@/presentation/api";

export const POST = async (request: Request): Promise<Response> =>
  handlePostUnfollowTargetRoute(request);
