import type { CSSProperties } from "react";

import type { ApplicationApi } from "@/application";

type PublicProfileQuery = Pick<ApplicationApi, "getPublicProfileBySlug">;

export type PublicProfilePageModel =
  | {
      status: "success";
      profile: {
        slug: string;
        displayName: string;
        role: string;
        profileType: string;
        bio: string;
        avatarUrl: string | null;
        followerCount: number;
      };
      connections: {
        fundraisers: Array<{
          slug: string;
          title: string;
          status: string;
          goalAmount: number;
        }>;
        communities: Array<{
          slug: string;
          name: string;
          visibility: string;
        }>;
      };
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
  publicProfileQuery: PublicProfileQuery;
};

export const buildPublicProfilePageModel = async (
  dependencies: BuildDependencies,
  slug: string,
): Promise<PublicProfilePageModel> => {
  const result = await dependencies.publicProfileQuery.getPublicProfileBySlug({
    slug,
  });

  switch (result.status) {
    case "success":
      return {
        status: "success",
        profile: result.data.profile,
        connections: result.data.connections,
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

type PublicProfilePageProps = {
  model: PublicProfilePageModel;
};

export const PublicProfilePage = ({ model }: PublicProfilePageProps) => {
  if (model.status === "invalid_request") {
    return (
      <main style={pageContainerStyle}>
        <section style={cardStyle}>
          <h1 style={headingStyle}>Invalid profile request</h1>
          <p style={bodyTextStyle}>{model.message}</p>
        </section>
      </main>
    );
  }

  if (model.status === "not_found") {
    return (
      <main style={pageContainerStyle}>
        <section style={cardStyle}>
          <h1 style={headingStyle}>Profile not found</h1>
          <p style={bodyTextStyle}>
            {model.message} Tried slug: <strong>{model.slug}</strong>
          </p>
        </section>
      </main>
    );
  }

  return (
    <main style={pageContainerStyle}>
      <section style={cardStyle}>
        <p style={eyebrowStyle}>Public profile</p>
        <h1 style={headingStyle}>{model.profile.displayName}</h1>
        <p style={metaStyle}>
          {toTitleCase(model.profile.profileType)} profile ·{" "}
          {toTitleCase(model.profile.role)} role
        </p>
        <p style={bodyTextStyle}>{model.profile.bio}</p>
        <p style={bodyTextStyle}>
          Followers: <strong>{model.profile.followerCount}</strong>
        </p>
      </section>

      <section style={cardStyle}>
        <h2 style={sectionHeadingStyle}>Connected fundraisers</h2>
        {model.connections.fundraisers.length > 0 ? (
          <ul style={listStyle}>
            {model.connections.fundraisers.map((fundraiser) => (
              <li key={fundraiser.slug} style={listItemStyle}>
                <a href={`/fundraisers/${fundraiser.slug}`} style={linkStyle}>
                  {fundraiser.title}
                </a>
                <p style={bodyTextStyle}>
                  {toTitleCase(fundraiser.status)} ·{" "}
                  {formatCurrency(fundraiser.goalAmount)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p style={bodyTextStyle}>No connected fundraisers yet.</p>
        )}
      </section>

      <section style={cardStyle}>
        <h2 style={sectionHeadingStyle}>Connected communities</h2>
        {model.connections.communities.length > 0 ? (
          <ul style={listStyle}>
            {model.connections.communities.map((community) => (
              <li key={community.slug} style={listItemStyle}>
                <a href={`/communities/${community.slug}`} style={linkStyle}>
                  {community.name}
                </a>
                <p style={bodyTextStyle}>{toTitleCase(community.visibility)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p style={bodyTextStyle}>No connected communities yet.</p>
        )}
      </section>
    </main>
  );
};

const pageContainerStyle: CSSProperties = {
  display: "grid",
  gap: "20px",
  margin: "0 auto",
  maxWidth: "900px",
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

const eyebrowStyle: CSSProperties = {
  color: "#3c5c97",
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
  lineHeight: 1.5,
  margin: "8px 0 0",
};

const listStyle: CSSProperties = {
  display: "grid",
  gap: "14px",
  listStyle: "none",
  margin: "16px 0 0",
  padding: 0,
};

const listItemStyle: CSSProperties = {
  border: "1px solid rgba(16, 24, 40, 0.08)",
  borderRadius: "12px",
  padding: "14px 16px",
};

const linkStyle: CSSProperties = {
  color: "#1d4ed8",
  fontSize: "1.02rem",
  fontWeight: 600,
  textDecoration: "none",
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
