import { getApplicationApi } from "../application-api";
import { jsonResponse, parseJsonBody } from "../http";
import { createSessionCookieHeader } from "@/presentation/auth";

import { sessionTokenHeader } from "./session-header";

type SignUpBody = {
  email?: string;
  displayName?: string;
  password?: string;
  role?: string;
};

export const handlePostSignUpRoute = async (
  request: Request,
): Promise<Response> => {
  const body = await parseJsonBody<SignUpBody>(request);

  if (!body?.email || !body.displayName || !body.password) {
    return jsonResponse(
      {
        error: "invalid_request",
        message: "email, displayName, and password are required.",
      },
      400,
    );
  }

  const result = await getApplicationApi().signUp({
    email: body.email,
    displayName: body.displayName,
    password: body.password,
    role: body.role,
  });

  switch (result.status) {
    case "invalid_request":
      return jsonResponse({ error: result.status, message: result.message }, 400);
    case "conflict":
      return jsonResponse({ error: result.status, message: result.message }, 409);
    case "success":
      return jsonResponse(
        {
          viewer: result.viewer,
          sessionToken: result.sessionToken,
          meta: {
            sessionTokenHeader,
          },
        },
        {
          status: 201,
          headers: {
            "set-cookie": createSessionCookieHeader(result.sessionToken),
          },
        },
      );
  }
};
