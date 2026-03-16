import { handlePostFollowTargetRoute } from "@/presentation/api";

export const POST = async (request: Request): Promise<Response> =>
  handlePostFollowTargetRoute(request);
