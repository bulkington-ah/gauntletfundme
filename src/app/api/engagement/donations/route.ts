import { handlePostSubmitDonationRoute } from "@/presentation/api";

export const POST = async (request: Request): Promise<Response> =>
  handlePostSubmitDonationRoute(request);
