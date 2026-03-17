import { handlePostLoginRoute } from "@/presentation/api";

export const POST = async (request: Request): Promise<Response> =>
  handlePostLoginRoute(request);
