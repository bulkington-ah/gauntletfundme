import { handlePostSignUpRoute } from "@/presentation/api";

export const POST = async (request: Request): Promise<Response> =>
  handlePostSignUpRoute(request);
