import { evaluateAuthorizationPolicy } from "@/domain";

const ownerViewer = {
  userId: "user_owner",
  role: "organizer" as const,
};

const memberViewer = {
  userId: "user_member",
  role: "supporter" as const,
};

const moderatorViewer = {
  userId: "user_moderator",
  role: "moderator" as const,
};

describe("authorization policy", () => {
  it("rejects anonymous viewers for protected actions", () => {
    const profileEdit = evaluateAuthorizationPolicy({
      action: "edit_profile",
      viewer: null,
      ownerUserId: "user_owner",
    });
    const commentCreate = evaluateAuthorizationPolicy({
      action: "create_comment",
      viewer: null,
    });
    const follow = evaluateAuthorizationPolicy({
      action: "follow_target",
      viewer: null,
      ownerUserId: "user_owner",
    });

    expect(profileEdit).toEqual({
      allowed: false,
      reason: "unauthenticated",
      message: "Authentication is required to edit profiles.",
    });
    expect(commentCreate).toEqual({
      allowed: false,
      reason: "unauthenticated",
      message: "Authentication is required to create comments.",
    });
    expect(follow).toEqual({
      allowed: false,
      reason: "unauthenticated",
      message: "Authentication is required for follow commands.",
    });
  });

  it("allows owners to manage owned resources", () => {
    expect(
      evaluateAuthorizationPolicy({
        action: "edit_profile",
        viewer: ownerViewer,
        ownerUserId: "user_owner",
      }),
    ).toEqual({ allowed: true });
    expect(
      evaluateAuthorizationPolicy({
        action: "manage_community",
        viewer: ownerViewer,
        ownerUserId: "user_owner",
      }),
    ).toEqual({ allowed: true });
    expect(
      evaluateAuthorizationPolicy({
        action: "create_post",
        viewer: ownerViewer,
        ownerUserId: "user_owner",
      }),
    ).toEqual({ allowed: true });
  });

  it("allows moderators to bypass ownership checks for management and moderation actions", () => {
    expect(
      evaluateAuthorizationPolicy({
        action: "manage_community",
        viewer: moderatorViewer,
        ownerUserId: "user_owner",
      }),
    ).toEqual({ allowed: true });
    expect(
      evaluateAuthorizationPolicy({
        action: "moderate_content",
        viewer: moderatorViewer,
        ownerUserId: "user_owner",
      }),
    ).toEqual({ allowed: true });
  });

  it("rejects non-owner members for owner-scoped actions", () => {
    expect(
      evaluateAuthorizationPolicy({
        action: "edit_profile",
        viewer: memberViewer,
        ownerUserId: "user_owner",
      }),
    ).toEqual({
      allowed: false,
      reason: "forbidden",
      message: "Only the profile owner, moderator, or admin can edit this profile.",
    });
    expect(
      evaluateAuthorizationPolicy({
        action: "manage_community",
        viewer: memberViewer,
        ownerUserId: "user_owner",
      }),
    ).toEqual({
      allowed: false,
      reason: "forbidden",
      message:
        "Only the community owner, moderator, or admin can manage this community.",
    });
    expect(
      evaluateAuthorizationPolicy({
        action: "moderate_content",
        viewer: memberViewer,
        ownerUserId: "user_owner",
      }),
    ).toEqual({
      allowed: false,
      reason: "forbidden",
      message:
        "Only an authorized owner, moderator, or admin can moderate this content.",
    });
  });

  it("allows members to comment and create donation intents", () => {
    expect(
      evaluateAuthorizationPolicy({
        action: "create_comment",
        viewer: memberViewer,
      }),
    ).toEqual({ allowed: true });
    expect(
      evaluateAuthorizationPolicy({
        action: "create_donation_intent",
        viewer: memberViewer,
      }),
    ).toEqual({ allowed: true });
  });

  it("blocks self-follow and allows follows for non-owned targets", () => {
    expect(
      evaluateAuthorizationPolicy({
        action: "follow_target",
        viewer: memberViewer,
        ownerUserId: "user_member",
      }),
    ).toEqual({
      allowed: false,
      reason: "forbidden",
      message: "You cannot follow your own profile, fundraiser, or community.",
    });

    expect(
      evaluateAuthorizationPolicy({
        action: "follow_target",
        viewer: memberViewer,
        ownerUserId: "user_owner",
      }),
    ).toEqual({ allowed: true });
  });
});
