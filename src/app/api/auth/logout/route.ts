import { handlePostLogoutRoute } from "@/presentation/api";

export const POST = async (request: Request): Promise<Response> =>
  handlePostLogoutRoute(request);
