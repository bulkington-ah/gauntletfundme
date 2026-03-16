export const jsonResponse = (body: unknown, status = 200): Response =>
  Response.json(body, { status });

export const parseJsonBody = async <TBody>(
  request: Request,
): Promise<TBody | null> => {
  try {
    return (await request.json()) as TBody;
  } catch {
    return null;
  }
};
