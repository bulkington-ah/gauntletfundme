import OpenAI from "openai";

import type {
  SupporterDigestNarration,
  SupporterDigestNarrator,
} from "@/application/engagement";

const defaultModel = "gpt-5-mini";
const defaultTimeoutMs = 8_000;
const defaultMaxOutputTokens = 2_500;
const maxAttempts = 3;

type ResponsesClient = {
  responses: {
    create(input: Record<string, unknown>): Promise<{
      output_text?: string;
    }>;
  };
};

type Dependencies = {
  apiKey?: string | null;
  client?: ResponsesClient;
  model?: string;
  timeoutMs?: number;
};

export const createOpenAiSupporterDigestNarrator = (
  dependencies: Dependencies = {},
): SupporterDigestNarrator => {
  const apiKey =
    dependencies.apiKey ?? process.env.OPENAI_API_KEY ?? null;
  const model =
    dependencies.model ??
    process.env.OPENAI_DIGEST_MODEL ??
    defaultModel;
  const timeoutMs =
    dependencies.timeoutMs ??
    parseTimeoutMs(process.env.OPENAI_DIGEST_TIMEOUT_MS) ??
    defaultTimeoutMs;
  const client =
    dependencies.client ??
    (apiKey
      ? new OpenAI({
          apiKey,
          timeout: timeoutMs,
        })
      : null);

  return {
    async narrateDigest(input) {
      if (!client) {
        return {
          status: "unavailable",
          reason: "missing_configuration",
          message: "OPENAI_API_KEY is not configured for supporter digest narration.",
        };
      }

      try {
        const response = await createWithRetry(client, {
          model,
          instructions: buildInstructions(),
          input: JSON.stringify(
            {
              viewerUserId: input.viewerUserId,
              windowStart: input.windowStart.toISOString(),
              windowEnd: input.windowEnd.toISOString(),
              highlights: input.highlights.map((highlight) => ({
                candidateId: highlight.id,
                type: highlight.type,
                href: highlight.href,
                facts: toHighlightFacts(highlight),
              })),
            },
            null,
            2,
          ),
          max_output_tokens: defaultMaxOutputTokens,
          reasoning: {
            effort: "minimal",
          },
          text: {
            format: {
              type: "json_schema",
              name: "supporter_digest_narration",
              strict: true,
              schema: supporterDigestNarrationSchema,
            },
          },
        });
        const parsed = parseNarrationResponse(response.output_text);

        return parsed
          ? {
              status: "success",
              items: parsed.items,
            }
          : {
              status: "unavailable",
              reason: "invalid_response",
              message: "OpenAI returned invalid structured narration output.",
            };
      } catch (error) {
        return {
          status: "unavailable",
          reason: "provider_error",
          message: error instanceof Error ? error.message : "OpenAI narration failed.",
        };
      }
    },
  };
};

const buildInstructions = (): string =>
  [
    "You write concise supporter digest copy for a fundraising and community product.",
    "Rewrite only the supplied facts into clear, grounded highlights.",
    "Do not invent names, counts, links, milestones, or reasons that are not present in the input.",
    "Return short, direct copy that sounds factual and trustworthy.",
    "Each item must keep the same candidateId from the input.",
    "Prefer action labels like 'Read update', 'Join discussion', 'View fundraiser', or 'Support fundraiser'.",
  ].join(" ");

const toHighlightFacts = (
  highlight: Parameters<SupporterDigestNarrator["narrateDigest"]>[0]["highlights"][number],
): Record<string, string | number> => {
  switch (highlight.type) {
    case "community_update":
      return {
        communitySlug: highlight.communitySlug,
        communityName: highlight.communityName,
        organizerDisplayName: highlight.organizerDisplayName,
        postId: highlight.postId,
        postTitle: highlight.postTitle,
        occurredAt: highlight.createdAt.toISOString(),
      };
    case "community_discussion_burst":
      return {
        communitySlug: highlight.communitySlug,
        communityName: highlight.communityName,
        postId: highlight.postId,
        postTitle: highlight.postTitle,
        newCommentCount: highlight.newCommentCount,
        participantCount: highlight.participantCount,
        occurredAt: highlight.createdAt.toISOString(),
      };
    case "fundraiser_momentum":
      return {
        fundraiserSlug: highlight.fundraiserSlug,
        fundraiserTitle: highlight.fundraiserTitle,
        newDonationCount: highlight.newDonationCount,
        newAmountRaised: highlight.newAmountRaised,
        newSupporterCount: highlight.newSupporterCount,
        occurredAt: highlight.createdAt.toISOString(),
      };
    case "fundraiser_milestone":
      return {
        fundraiserSlug: highlight.fundraiserSlug,
        fundraiserTitle: highlight.fundraiserTitle,
        milestonePercent: highlight.milestonePercent,
        goalAmount: highlight.goalAmount,
        amountRaisedAfterWindow: highlight.amountRaisedAfterWindow,
        newDonationCount: highlight.newDonationCount,
        newAmountRaised: highlight.newAmountRaised,
        occurredAt: highlight.createdAt.toISOString(),
      };
  }
};

const supporterDigestNarrationSchema = {
  type: "object",
  additionalProperties: false,
  required: ["items"],
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["candidateId", "headline", "body", "ctaLabel"],
        properties: {
          candidateId: {
            type: "string",
          },
          headline: {
            type: "string",
          },
          body: {
            type: "string",
          },
          ctaLabel: {
            type: "string",
          },
        },
      },
    },
  },
} as const;

const parseNarrationResponse = (
  outputText: string | undefined,
): { items: SupporterDigestNarration[] } | null => {
  if (!outputText) {
    return null;
  }

  try {
    const parsed = JSON.parse(outputText) as {
      items?: unknown;
    };

    if (!Array.isArray(parsed.items)) {
      return null;
    }

    const items = parsed.items
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const narration = item as Record<string, unknown>;

        if (
          typeof narration.candidateId !== "string" ||
          typeof narration.headline !== "string" ||
          typeof narration.body !== "string" ||
          typeof narration.ctaLabel !== "string"
        ) {
          return null;
        }

        return {
          candidateId: narration.candidateId,
          headline: narration.headline,
          body: narration.body,
          ctaLabel: narration.ctaLabel,
        } satisfies SupporterDigestNarration;
      })
      .filter(
        (item): item is SupporterDigestNarration => item !== null,
      );

    return items.length === parsed.items.length ? { items } : null;
  } catch {
    return null;
  }
};

const createWithRetry = async (
  client: ResponsesClient,
  input: Record<string, unknown>,
): Promise<{
  output_text?: string;
}> => {
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt += 1;

    try {
      return await client.responses.create(input);
    } catch (error) {
      if (!isTransientOpenAiError(error) || attempt >= maxAttempts) {
        throw error;
      }

      await sleep(200 * 2 ** (attempt - 1));
    }
  }

  throw new Error("OpenAI narration retries were exhausted.");
};

const isTransientOpenAiError = (error: unknown): boolean =>
  error instanceof OpenAI.RateLimitError ||
  error instanceof OpenAI.InternalServerError ||
  error instanceof OpenAI.APIConnectionError ||
  error instanceof OpenAI.APIConnectionTimeoutError ||
  (error instanceof OpenAI.APIError &&
    typeof error.status === "number" &&
    error.status >= 500);

const parseTimeoutMs = (value: string | undefined): number | null => {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const sleep = async (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
