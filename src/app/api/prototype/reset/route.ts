import { handlePostResetPrototypeDataRoute } from "@/presentation/api";

export const POST = async (): Promise<Response> =>
  handlePostResetPrototypeDataRoute();
