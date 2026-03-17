import { getApplicationApi } from "../application-api";
import { jsonResponse, parseJsonBody } from "../http";
import { createSessionCookieHeader } from "@/presentation/auth";

import { sessionTokenHeader } from "./session-header";

type LoginBody = {
  email?: string;
  password?: string;
};

export const handlePostLoginRoute = async (request: Request): Promise<Response> => {
  const body = await parseJsonBody<LoginBody>(request);

  if (!body?.email || !body.password) {
    return jsonResponse(
      {
        error: "invalid_request",
        message: "email and password are required.",
      },
      400,
    );
  }

  const result = await getApplicationApi().login({
    email: body.email,
    password: body.password,
  });

  switch (result.status) {
    case "invalid_request":
      return jsonResponse({ error: result.status, message: result.message }, 400);
    case "unauthorized":
      return jsonResponse({ error: result.status, message: result.message }, 401);
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
          status: 200,
          headers: {
            "set-cookie": createSessionCookieHeader(result.sessionToken),
          },
        },
      );
  }
};
