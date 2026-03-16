import { handleGetPublicProfileRoute } from "@/presentation/api";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export const GET = async (
  request: Request,
  context: RouteContext,
): Promise<Response> =>
  handleGetPublicProfileRoute(request, { slug: (await context.params).slug });
