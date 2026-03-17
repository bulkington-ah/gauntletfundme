import { handlePostSubmitReportRoute } from "@/presentation/api";

export const POST = async (request: Request): Promise<Response> =>
  handlePostSubmitReportRoute(request);
