import { resolveAuthenticatedLoginRedirect } from "@/presentation/auth";

describe("login navigation helpers", () => {
  it("returns the safe internal next path for authenticated viewers", () => {
    expect(
      resolveAuthenticatedLoginRedirect(
        {
          userId: "user_organizer_avery",
          role: "organizer",
        },
        "/fundraisers/warm-meals-2026",
      ),
    ).toBe("/fundraisers/warm-meals-2026");
  });

  it("falls back to / for authenticated viewers when next is unsafe", () => {
    expect(
      resolveAuthenticatedLoginRedirect(
        {
          userId: "user_organizer_avery",
          role: "organizer",
        },
        "https://malicious.example.com",
      ),
    ).toBe("/");
  });

  it("returns null for anonymous viewers", () => {
    expect(
      resolveAuthenticatedLoginRedirect(null, "/profiles/avery-johnson"),
    ).toBeNull();
  });
});
