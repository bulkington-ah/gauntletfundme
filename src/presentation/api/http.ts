export const jsonResponse = (
  body: unknown,
  init: number | ResponseInit = 200,
): Response =>
  Response.json(body, typeof init === "number" ? { status: init } : init);

export const parseJsonBody = async <TBody>(
  request: Request,
): Promise<TBody | null> => {
  try {
    return (await request.json()) as TBody;
  } catch {
    return null;
  }
};
