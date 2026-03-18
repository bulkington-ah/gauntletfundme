import { render, screen, waitFor } from "@testing-library/react";

import { SupporterDigestPage } from "@/presentation/digest";

const refreshMock = vi.fn();
const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
    replace: replaceMock,
  }),
}));

describe("SupporterDigestPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    refreshMock.mockReset();
    replaceMock.mockReset();
  });

  it("renders AI-assisted digest highlights and acknowledges the viewed window", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchSpy);

    render(
      <SupporterDigestPage
        digest={createDigestModel()}
        viewer={{
          userId: "user_supporter_jordan",
          role: "supporter",
        }}
        viewerProfileSlug="jordan-lee"
      />,
    );

    expect(screen.getByText("What changed since your last check-in")).toBeVisible();
    expect(screen.getByText("AI-assisted summary")).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Read update" }),
    ).toHaveAttribute(
      "href",
      "/communities/neighbors-helping-neighbors#post-post_evening_update",
    );

    await waitFor(() =>
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/engagement/digest-views",
        expect.objectContaining({
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            viewedThrough: "2026-03-18T12:00:00.000Z",
          }),
        }),
      ),
    );
  });

  it("shows a deterministic fallback note when AI narration is unavailable", () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null)));

    render(
      <SupporterDigestPage
        digest={createDigestModel({
          generationMode: "deterministic",
        })}
        viewer={{
          userId: "user_supporter_jordan",
          role: "supporter",
        }}
      />,
    );

    expect(screen.getByText("Grounded fallback summary")).toBeVisible();
    expect(
      screen.getByText(
        "AI narration is unavailable right now, so you're seeing the deterministic digest copy instead.",
      ),
    ).toBeVisible();
  });

  it("renders an empty state when there are no new digest highlights", () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null)));

    render(
      <SupporterDigestPage
        digest={createDigestModel({
          highlights: [],
        })}
        viewer={{
          userId: "user_supporter_jordan",
          role: "supporter",
        }}
      />,
    );

    expect(screen.getByText("Nothing new yet.")).toBeVisible();
    expect(
      screen.getByText(
        "The causes you follow are quiet for now. Check back after the next fundraiser push or community update.",
      ),
    ).toBeVisible();
  });
});

const createDigestModel = ({
  generationMode = "openai" as const,
  highlights = [
    {
      id: "community_update:post_evening_update",
      type: "community_update" as const,
      headline: "Avery shared a new organizer update.",
      body: "Supporters can now catch up on the latest evening prep details.",
      ctaLabel: "Read update",
      href: "/communities/neighbors-helping-neighbors#post-post_evening_update",
      occurredAt: "2026-03-18T10:30:00.000Z",
      score: 144,
    },
  ],
}: {
  generationMode?: "openai" | "deterministic";
  highlights?: {
    id: string;
    type: "community_update";
    headline: string;
    body: string;
    ctaLabel: string;
    href: string;
    occurredAt: string;
    score: number;
  }[];
} = {}) => ({
  kind: "supporter_digest" as const,
  windowStart: "2026-03-17T18:00:00.000Z",
  windowEnd: "2026-03-18T12:00:00.000Z",
  generationMode,
  highlights,
});
