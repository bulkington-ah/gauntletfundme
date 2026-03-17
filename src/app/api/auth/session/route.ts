import { handleGetSessionRoute } from "@/presentation/api";

export const GET = async (request: Request): Promise<Response> =>
  handleGetSessionRoute(request);
