export const protectedActions = [
  "edit_profile",
  "manage_community",
  "create_post",
  "create_comment",
  "follow_target",
  "submit_donation",
  "report_content",
  "moderate_content",
] as const;

export type ProtectedAction = (typeof protectedActions)[number];

export type AuthorizationRole = "supporter" | "organizer" | "moderator" | "admin";

export type AuthorizationViewer = {
  userId: string;
  role: AuthorizationRole;
};

export type AuthorizationPolicyInput = {
  action: ProtectedAction;
  viewer: AuthorizationViewer | null;
  ownerUserId?: string | null;
};

export type AuthorizationPolicyDecision =
  | {
      allowed: true;
    }
  | {
      allowed: false;
      reason: "unauthenticated" | "forbidden";
      message: string;
    };

export const evaluateAuthorizationPolicy = (
  input: AuthorizationPolicyInput,
): AuthorizationPolicyDecision => {
  if (!input.viewer) {
    return {
      allowed: false,
      reason: "unauthenticated",
      message: unauthenticatedMessageByAction[input.action],
    };
  }

  switch (input.action) {
    case "create_comment":
    case "submit_donation":
    case "report_content":
      return { allowed: true };
    case "follow_target":
      if (input.ownerUserId && input.ownerUserId === input.viewer.userId) {
        return {
          allowed: false,
          reason: "forbidden",
          message: "You cannot follow your own profile, fundraiser, or community.",
        };
      }

      return { allowed: true };
    case "edit_profile":
      return canManageOwnedResource(
        input.viewer,
        input.ownerUserId,
        "Only the profile owner, moderator, or admin can edit this profile.",
      );
    case "manage_community":
      return canManageOwnedResource(
        input.viewer,
        input.ownerUserId,
        "Only the community owner, moderator, or admin can manage this community.",
      );
    case "create_post":
      return canManageOwnedResource(
        input.viewer,
        input.ownerUserId,
        "Only an authorized owner, moderator, or admin can create posts.",
      );
    case "moderate_content":
      return canManageOwnedResource(
        input.viewer,
        input.ownerUserId,
        "Only an authorized owner, moderator, or admin can moderate this content.",
      );
  }
};

const canManageOwnedResource = (
  viewer: AuthorizationViewer,
  ownerUserId: string | null | undefined,
  unauthorizedMessage: string,
): AuthorizationPolicyDecision => {
  if (
    viewer.role === "moderator" ||
    viewer.role === "admin" ||
    (ownerUserId ? ownerUserId === viewer.userId : false)
  ) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: "forbidden",
    message: unauthorizedMessage,
  };
};

const unauthenticatedMessageByAction: Record<ProtectedAction, string> = {
  edit_profile: "Authentication is required to edit profiles.",
  manage_community: "Authentication is required to manage communities.",
  create_post: "Authentication is required to create posts.",
  create_comment: "Authentication is required to create comments.",
  follow_target: "Authentication is required for follow commands.",
  submit_donation: "Authentication is required to submit donations.",
  report_content: "Authentication is required to submit reports.",
  moderate_content: "Authentication is required to moderate content.",
};
