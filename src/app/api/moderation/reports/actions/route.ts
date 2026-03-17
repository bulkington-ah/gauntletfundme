import { handlePostResolveReportRoute } from "@/presentation/api";

export const POST = async (request: Request): Promise<Response> =>
  handlePostResolveReportRoute(request);
