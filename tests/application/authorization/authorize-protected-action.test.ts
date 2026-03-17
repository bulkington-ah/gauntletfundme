import { authorizeProtectedAction } from "@/application";

describe("authorizeProtectedAction", () => {
  it("returns unauthorized for anonymous viewers", () => {
    const result = authorizeProtectedAction({
      action: "create_comment",
      viewer: null,
    });

    expect(result).toEqual({
      status: "unauthorized",
      message: "Authentication is required to create comments.",
    });
  });

  it("returns authorized for owner-scoped actions when viewer owns the resource", () => {
    const result = authorizeProtectedAction({
      action: "manage_community",
      viewer: {
        userId: "user_owner",
        role: "organizer",
      },
      ownerUserId: "user_owner",
    });

    expect(result).toEqual({
      status: "authorized",
      viewer: {
        userId: "user_owner",
        role: "organizer",
      },
    });
  });

  it("returns authorized for moderators on moderation actions", () => {
    const result = authorizeProtectedAction({
      action: "moderate_content",
      viewer: {
        userId: "user_moderator",
        role: "moderator",
      },
      ownerUserId: "user_owner",
    });

    expect(result).toEqual({
      status: "authorized",
      viewer: {
        userId: "user_moderator",
        role: "moderator",
      },
    });
  });

  it("returns forbidden for non-owner members on owner-scoped actions", () => {
    const result = authorizeProtectedAction({
      action: "create_post",
      viewer: {
        userId: "user_member",
        role: "supporter",
      },
      ownerUserId: "user_owner",
    });

    expect(result).toEqual({
      status: "forbidden",
      message: "Only an authorized owner, moderator, or admin can create posts.",
    });
  });

  it("returns forbidden for self-follow attempts", () => {
    const result = authorizeProtectedAction({
      action: "follow_target",
      viewer: {
        userId: "user_member",
        role: "supporter",
      },
      ownerUserId: "user_member",
    });

    expect(result).toEqual({
      status: "forbidden",
      message: "You cannot follow your own profile, fundraiser, or community.",
    });
  });
});
