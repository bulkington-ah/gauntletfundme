import { handlePostCreateCommentRoute } from "@/presentation/api";

export const POST = async (request: Request): Promise<Response> =>
  handlePostCreateCommentRoute(request);
