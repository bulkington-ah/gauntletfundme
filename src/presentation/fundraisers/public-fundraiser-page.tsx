import type { CSSProperties } from "react";

import type { ApplicationApi } from "@/application";

type PublicFundraiserQuery = Pick<ApplicationApi, "getPublicFundraiserBySlug">;

export type PublicFundraiserPageModel =
  | {
      status: "success";
      fundraiser: {
        slug: string;
        title: string;
        story: string;
        status: string;
        goalAmount: number;
        donationIntentCount: number;
      };
      organizer: {
        displayName: string;
        role: string;
        profileSlug: string | null;
      };
      community: {
        slug: string;
        name: string;
        visibility: string;
      } | null;
    }
  | {
      status: "invalid_request";
      message: string;
    }
  | {
      status: "not_found";
      slug: string;
      message: string;
    };

type BuildDependencies = {
  publicFundraiserQuery: PublicFundraiserQuery;
};

export const buildPublicFundraiserPageModel = async (
  dependencies: BuildDependencies,
  slug: string,
): Promise<PublicFundraiserPageModel> => {
  const result = await dependencies.publicFundraiserQuery.getPublicFundraiserBySlug({
    slug,
  });

  switch (result.status) {
    case "success":
      return {
        status: "success",
        fundraiser: result.data.fundraiser,
        organizer: result.data.organizer,
        community: result.data.community,
      };
    case "invalid_request":
      return {
        status: "invalid_request",
        message: result.message,
      };
    case "not_found":
      return {
        status: "not_found",
        slug,
        message: result.message,
      };
  }
};

type PublicFundraiserPageProps = {
  model: PublicFundraiserPageModel;
};

export const PublicFundraiserPage = ({ model }: PublicFundraiserPageProps) => {
  if (model.status === "invalid_request") {
    return (
      <main style={pageContainerStyle}>
        <section style={cardStyle}>
          <h1 style={headingStyle}>Invalid fundraiser request</h1>
          <p style={bodyTextStyle}>{model.message}</p>
        </section>
      </main>
    );
  }

  if (model.status === "not_found") {
    return (
      <main style={pageContainerStyle}>
        <section style={cardStyle}>
          <h1 style={headingStyle}>Fundraiser not found</h1>
          <p style={bodyTextStyle}>
            {model.message} Tried slug: <strong>{model.slug}</strong>
          </p>
        </section>
      </main>
    );
  }

  const fundraiserStatus = toTitleCase(model.fundraiser.status);
  const organizerRole = toTitleCase(model.organizer.role);

  return (
    <main style={pageContainerStyle}>
      <section style={heroCardStyle}>
        <p style={eyebrowStyle}>Public fundraiser</p>
        <h1 style={headingStyle}>{model.fundraiser.title}</h1>
        <p style={metaStyle}>
          Status: {fundraiserStatus} · Goal: {formatCurrency(model.fundraiser.goalAmount)}
        </p>
        <p style={bodyTextStyle}>{model.fundraiser.story}</p>
      </section>

      <section style={cardStyle}>
        <h2 style={sectionHeadingStyle}>Organizer context</h2>
        <p style={bodyTextStyle}>
          {model.organizer.displayName} · {organizerRole}
        </p>
        {model.organizer.profileSlug ? (
          <a href={`/profiles/${model.organizer.profileSlug}`} style={linkStyle}>
            View organizer profile
          </a>
        ) : (
          <p style={bodyTextStyle}>Organizer profile link not available.</p>
        )}
      </section>

      <section style={cardStyle}>
        <h2 style={sectionHeadingStyle}>Prototype progress</h2>
        <p style={bodyTextStyle}>
          Mock donation intents started:{" "}
          <strong>{model.fundraiser.donationIntentCount}</strong>
        </p>
        <div style={progressTrackStyle}>
          <div
            style={{
              ...progressFillStyle,
              width: `${toProgressWidth(model.fundraiser.donationIntentCount)}%`,
            }}
          />
        </div>
        <p style={helperTextStyle}>
          Progress reflects mocked intent starts, not real payment volume.
        </p>
      </section>

      <section style={cardStyle}>
        <h2 style={sectionHeadingStyle}>Mocked donation entry</h2>
        <a
          href={`/fundraisers/${model.fundraiser.slug}?checkout=mock`}
          style={mockDonateCtaStyle}
        >
          Start mocked donation
        </a>
        <p style={helperTextStyle}>
          This CTA is intentionally mocked and does not collect payment details.
        </p>
      </section>

      <section style={cardStyle}>
        <h2 style={sectionHeadingStyle}>Connected community</h2>
        {model.community ? (
          <>
            <a href={`/communities/${model.community.slug}`} style={linkStyle}>
              {model.community.name}
            </a>
            <p style={bodyTextStyle}>{toTitleCase(model.community.visibility)}</p>
          </>
        ) : (
          <p style={bodyTextStyle}>No community connected yet.</p>
        )}
      </section>
    </main>
  );
};

const pageContainerStyle: CSSProperties = {
  display: "grid",
  gap: "20px",
  margin: "0 auto",
  maxWidth: "920px",
  minHeight: "100vh",
  padding: "40px 20px 64px",
};

const cardStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid rgba(16, 24, 40, 0.08)",
  borderRadius: "18px",
  boxShadow: "0 12px 30px rgba(16, 24, 40, 0.05)",
  padding: "24px",
};

const heroCardStyle: CSSProperties = {
  ...cardStyle,
  background:
    "linear-gradient(145deg, rgba(16, 185, 129, 0.10), rgba(59, 130, 246, 0.08))",
};

const eyebrowStyle: CSSProperties = {
  color: "#146a56",
  fontSize: "0.8rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  margin: 0,
  textTransform: "uppercase",
};

const headingStyle: CSSProperties = {
  fontSize: "clamp(2rem, 6vw, 3rem)",
  lineHeight: 1.05,
  margin: "8px 0 10px",
};

const sectionHeadingStyle: CSSProperties = {
  fontSize: "1.3rem",
  margin: 0,
};

const metaStyle: CSSProperties = {
  color: "#344054",
  fontSize: "0.95rem",
  margin: "0 0 16px",
};

const bodyTextStyle: CSSProperties = {
  color: "#1f2937",
  lineHeight: 1.55,
  margin: "8px 0 0",
};

const helperTextStyle: CSSProperties = {
  color: "#475467",
  fontSize: "0.92rem",
  lineHeight: 1.5,
  margin: "10px 0 0",
};

const linkStyle: CSSProperties = {
  color: "#1d4ed8",
  display: "inline-block",
  fontSize: "1rem",
  fontWeight: 600,
  marginTop: "10px",
  textDecoration: "none",
};

const mockDonateCtaStyle: CSSProperties = {
  backgroundColor: "#111827",
  borderRadius: "10px",
  color: "#ffffff",
  display: "inline-block",
  fontWeight: 700,
  marginTop: "10px",
  padding: "12px 16px",
  textDecoration: "none",
};

const progressTrackStyle: CSSProperties = {
  backgroundColor: "#e5e7eb",
  borderRadius: "999px",
  height: "12px",
  marginTop: "12px",
  overflow: "hidden",
  width: "100%",
};

const progressFillStyle: CSSProperties = {
  background:
    "linear-gradient(90deg, rgba(16, 185, 129, 0.9), rgba(59, 130, 246, 0.9))",
  height: "100%",
  transition: "width 180ms ease",
};

const toTitleCase = (value: string): string =>
  value
    .split("_")
    .flatMap((word) => word.split(" "))
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const toProgressWidth = (donationIntentCount: number): number => {
  const maxVisibleIntents = 20;
  const normalized = Math.max(0, Math.min(donationIntentCount, maxVisibleIntents));
  return (normalized / maxVisibleIntents) * 100;
};
