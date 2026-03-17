export const GET = async (): Promise<Response> => {
  return Response.json(
    {
      status: "ok",
      service: "gofundme-v2",
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
};
