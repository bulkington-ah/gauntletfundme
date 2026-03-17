import {
  evaluateAuthorizationPolicy,
  type ProtectedAction,
} from "@/domain";

import type { AuthenticatedViewer } from "@/application/engagement";

export type AuthorizeProtectedActionInput = {
  action: ProtectedAction;
  viewer: AuthenticatedViewer | null;
  ownerUserId?: string | null;
};

export type AuthorizeProtectedActionResult =
  | {
      status: "authorized";
      viewer: AuthenticatedViewer;
    }
  | {
      status: "unauthorized" | "forbidden";
      message: string;
    };

export const authorizeProtectedAction = (
  input: AuthorizeProtectedActionInput,
): AuthorizeProtectedActionResult => {
  const decision = evaluateAuthorizationPolicy({
    action: input.action,
    viewer: input.viewer,
    ownerUserId: input.ownerUserId,
  });

  if (decision.allowed) {
    if (!input.viewer) {
      throw new Error("Authorization policy allowed an action without a viewer.");
    }

    return {
      status: "authorized",
      viewer: input.viewer,
    };
  }

  return {
    status: decision.reason === "unauthenticated" ? "unauthorized" : "forbidden",
    message: decision.message,
  };
};
