import { handleGetPublicFundraiserRoute } from "@/presentation/api";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export const GET = async (
  request: Request,
  context: RouteContext,
): Promise<Response> =>
  handleGetPublicFundraiserRoute(request, { slug: (await context.params).slug });
