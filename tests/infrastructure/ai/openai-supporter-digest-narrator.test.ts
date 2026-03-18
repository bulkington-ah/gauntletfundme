// @vitest-environment node

import OpenAI from "openai";

import { createOpenAiSupporterDigestNarrator } from "@/infrastructure";

describe("OpenAI supporter digest narrator", () => {
  it("returns an unavailable result when no OpenAI client can be configured", async () => {
    const narrator = createOpenAiSupporterDigestNarrator({
      apiKey: null,
    });

    await expect(
      narrator.narrateDigest(createNarrationInput()),
    ).resolves.toEqual({
      status: "unavailable",
      reason: "missing_configuration",
      message: "OPENAI_API_KEY is not configured for supporter digest narration.",
    });
  });

  it("sends structured narration requests and parses valid responses", async () => {
    const create = vi.fn().mockResolvedValue({
      output_text: JSON.stringify({
        items: [
          {
            candidateId: "community_update:post_evening_update",
            headline: "Avery shared a new organizer update.",
            body: "Supporters can now catch up on the latest evening prep details.",
            ctaLabel: "Read update",
          },
        ],
      }),
    });
    const narrator = createOpenAiSupporterDigestNarrator({
      client: {
        responses: {
          create,
        },
      },
      model: "gpt-5-mini",
    });

    const result = await narrator.narrateDigest(createNarrationInput());

    expect(result).toEqual({
      status: "success",
      items: [
        {
          candidateId: "community_update:post_evening_update",
          headline: "Avery shared a new organizer update.",
          body: "Supporters can now catch up on the latest evening prep details.",
          ctaLabel: "Read update",
        },
      ],
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-5-mini",
        max_output_tokens: 1200,
        reasoning: {
          effort: "minimal",
        },
        instructions: expect.stringContaining("Rewrite only the supplied facts"),
        input: expect.stringContaining("community_update:post_evening_update"),
        text: expect.objectContaining({
          format: expect.objectContaining({
            type: "json_schema",
            name: "supporter_digest_narration",
            strict: true,
          }),
        }),
      }),
    );
  });

  it("retries transient OpenAI failures before succeeding", async () => {
    vi.useFakeTimers();

    const create = vi
      .fn()
      .mockRejectedValueOnce(
        new OpenAI.RateLimitError(429, {}, "retry later", new Headers()),
      )
      .mockResolvedValueOnce({
        output_text: JSON.stringify({
          items: [
            {
              candidateId: "community_update:post_evening_update",
              headline: "Avery shared a new organizer update.",
              body: "Supporters can now catch up on the latest evening prep details.",
              ctaLabel: "Read update",
            },
          ],
        }),
      });
    const narrator = createOpenAiSupporterDigestNarrator({
      client: {
        responses: {
          create,
        },
      },
    });

    const narrationPromise = narrator.narrateDigest(createNarrationInput());

    await vi.runAllTimersAsync();

    await expect(narrationPromise).resolves.toMatchObject({
      status: "success",
    });
    expect(create).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it("returns invalid_response when structured output cannot be parsed", async () => {
    const narrator = createOpenAiSupporterDigestNarrator({
      client: {
        responses: {
          create: vi.fn().mockResolvedValue({
            output_text: JSON.stringify({
              items: [
                {
                  candidateId: "community_update:post_evening_update",
                  headline: "Missing body and CTA",
                },
              ],
            }),
          }),
        },
      },
    });

    await expect(
      narrator.narrateDigest(createNarrationInput()),
    ).resolves.toEqual({
      status: "unavailable",
      reason: "invalid_response",
      message: "OpenAI returned invalid structured narration output.",
    });
  });
});

const createNarrationInput = () => ({
  viewerUserId: "user_supporter_jordan",
  windowStart: new Date("2026-03-17T18:00:00.000Z"),
  windowEnd: new Date("2026-03-18T12:00:00.000Z"),
  highlights: [
    {
      id: "community_update:post_evening_update",
      type: "community_update" as const,
      entityKey: "community_post:post_evening_update",
      href: "/communities/neighbors-helping-neighbors#post-post_evening_update",
      createdAt: new Date("2026-03-18T10:30:00.000Z"),
      communitySlug: "neighbors-helping-neighbors",
      communityName: "Neighbors Helping Neighbors",
      organizerDisplayName: "Avery Johnson",
      postId: "post_evening_update",
      postTitle: "Evening prep shift",
      score: 144,
    },
  ],
});
