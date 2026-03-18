import { handlePostCreateFundraiserRoute } from "@/presentation/api";

export const POST = async (request: Request): Promise<Response> =>
  handlePostCreateFundraiserRoute(request);
