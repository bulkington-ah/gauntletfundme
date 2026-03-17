import { readSessionTokenFromRequest } from "@/presentation/auth";

import { sessionTokenHeader } from "../auth/session-header";
import { getApplicationApi } from "../application-api";
import { jsonResponse, parseJsonBody } from "../http";

type StartDonationIntentBody = {
  fundraiserSlug?: string;
  amount?: number;
};

export const handlePostStartDonationIntentRoute = async (
  request: Request,
): Promise<Response> => {
  const body = await parseJsonBody<StartDonationIntentBody>(request);

  if (!body?.fundraiserSlug || typeof body.amount !== "number") {
    return jsonResponse(
      {
        error: "invalid_request",
        message: "fundraiserSlug and numeric amount are required.",
      },
      400,
    );
  }

  const result = await getApplicationApi().startDonationIntent({
    sessionToken: readSessionTokenFromRequest(request),
    fundraiserSlug: body.fundraiserSlug,
    amount: body.amount,
  });

  switch (result.status) {
    case "invalid_request":
      return jsonResponse({ error: result.status, message: result.message }, 400);
    case "unauthorized":
      return jsonResponse(
        {
          error: result.status,
          message: result.message,
          meta: {
            sessionTokenHeader,
          },
        },
        401,
      );
    case "forbidden":
      return jsonResponse({ error: result.status, message: result.message }, 403);
    case "not_found":
      return jsonResponse({ error: result.status, message: result.message }, 404);
    case "success":
      return jsonResponse(
        {
          viewer: result.viewer,
          fundraiser: result.fundraiser,
          donationIntent: result.donationIntent,
          meta: {
            sessionTokenHeader,
            mockedCheckout: result.mockedCheckout,
          },
        },
        201,
      );
  }
};
