import { render, screen, waitFor } from "@testing-library/react";

import { SupporterDigestPage } from "@/presentation/digest";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

describe("SupporterDigestPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    refreshMock.mockReset();
  });

  it("renders deterministic highlights immediately, acknowledges the window, and upgrades to AI copy", async () => {
    const fetchSpy = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      if (url === "/api/engagement/digest-views") {
        return new Response(null, {
          status: 200,
        });
      }

      if (url === "/api/engagement/digest-narration") {
        expect(init?.body).toBe(
          JSON.stringify({
            windowStart: "2026-03-17T18:00:00.000Z",
            windowEnd: "2026-03-18T12:00:00.000Z",
          }),
        );

        return new Response(
          JSON.stringify({
            digest: createDigestModel({
              generationMode: "openai",
              narration: {
                status: "completed",
                reason: null,
              },
              summaryParagraph:
                "Avery shared a fresh community update, giving supporters a quick way to catch up before they jump into the latest highlight.",
            }),
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
        );
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });
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
    expect(screen.queryByText("AI-assisted summary")).not.toBeInTheDocument();
    expect(screen.queryByText("Grounded fallback summary")).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "AI narration is unavailable right now, so you're seeing the deterministic digest copy instead.",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Avery shared a fresh community update, giving supporters a quick way to catch up before they jump into the latest highlight.",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Avery Johnson posted a new update in Neighbors Helping Neighbors."),
    ).toBeVisible();

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
    await waitFor(() =>
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/engagement/digest-narration",
        expect.objectContaining({
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            windowStart: "2026-03-17T18:00:00.000Z",
            windowEnd: "2026-03-18T12:00:00.000Z",
          }),
        }),
      ),
    );

    await waitFor(() =>
      expect(screen.getByText("AI-assisted summary")).toBeVisible(),
    );
    expect(
      screen.getByText(
        "Avery shared a fresh community update, giving supporters a quick way to catch up before they jump into the latest highlight.",
      ),
    ).toBeVisible();
    expect(
      screen.getByText("Avery Johnson posted a new update in Neighbors Helping Neighbors."),
    ).toBeVisible();
  });

  it("keeps the deterministic digest visible when background narration fails", async () => {
    const fetchSpy = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      if (url === "/api/engagement/digest-views") {
        return new Response(null, {
          status: 200,
        });
      }

      if (url === "/api/engagement/digest-narration") {
        return new Response(null, {
          status: 503,
        });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchSpy);

    render(
      <SupporterDigestPage
        digest={createDigestModel()}
        viewer={{
          userId: "user_supporter_jordan",
          role: "supporter",
        }}
      />,
    );

    await waitFor(() =>
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/engagement/digest-narration",
        expect.objectContaining({
          method: "POST",
        }),
      ),
    );

    expect(
      screen.getByText("Avery Johnson posted a new update in Neighbors Helping Neighbors."),
    ).toBeVisible();
    expect(
      screen.queryByText(
        "Avery shared a fresh community update, giving supporters a quick way to catch up before they jump into the latest highlight.",
      ),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("AI-assisted summary")).not.toBeInTheDocument();
    expect(screen.queryByText("Grounded fallback summary")).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "AI narration is unavailable right now, so you're seeing the deterministic digest copy instead.",
      ),
    ).not.toBeInTheDocument();
  });

  it("renders an empty state without requesting background narration", async () => {
    const fetchSpy = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      if (url === "/api/engagement/digest-views") {
        return new Response(null, {
          status: 200,
        });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchSpy);

    render(
      <SupporterDigestPage
        digest={createDigestModel({
          highlights: [],
          narration: {
            status: "not_requested",
            reason: null,
          },
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
    expect(screen.queryByText("AI-assisted summary")).not.toBeInTheDocument();

    await waitFor(() =>
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/engagement/digest-views",
        expect.objectContaining({
          method: "POST",
        }),
      ),
    );
    expect(fetchSpy).not.toHaveBeenCalledWith(
      "/api/engagement/digest-narration",
      expect.anything(),
    );
  });
});

const createDigestModel = ({
  generationMode = "deterministic" as const,
  narration = {
    status: "pending" as const,
    reason: null,
  },
  summaryParagraph = null,
  highlights = [
    {
      id: "community_update:post_evening_update",
      type: "community_update" as const,
      headline: "Avery Johnson posted a new update in Neighbors Helping Neighbors.",
      body: "\"Evening prep shift\" is a fresh organizer update in Neighbors Helping Neighbors.",
      ctaLabel: "Read update",
      href: "/communities/neighbors-helping-neighbors#post-post_evening_update",
      occurredAt: "2026-03-18T10:30:00.000Z",
      score: 144,
    },
  ],
}: {
  generationMode?: "openai" | "deterministic";
  narration?: {
    status: "pending" | "completed" | "not_requested" | "unavailable";
    reason: "missing_configuration" | "provider_error" | "invalid_response" | null;
  };
  summaryParagraph?: string | null;
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
  narration,
  summaryParagraph,
  highlights,
});
