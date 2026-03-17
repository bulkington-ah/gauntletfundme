import { handlePostStartDonationIntentRoute } from "@/presentation/api";

export const POST = async (request: Request): Promise<Response> =>
  handlePostStartDonationIntentRoute(request);
