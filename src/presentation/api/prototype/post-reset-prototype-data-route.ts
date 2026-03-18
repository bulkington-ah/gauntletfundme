import { getApplicationApi } from "../application-api";
import { jsonResponse } from "../http";

export const handlePostResetPrototypeDataRoute = async (): Promise<Response> => {
  try {
    const result = await getApplicationApi().resetPrototypeData();

    return jsonResponse(
      {
        message: result.message,
      },
      200,
    );
  } catch {
    return jsonResponse(
      {
        error: "internal_error",
        message: "We couldn't reset the prototype data right now. Please try again.",
      },
      500,
    );
  }
};
