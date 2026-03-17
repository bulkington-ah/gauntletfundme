import type { CSSProperties } from "react";

import type { ApplicationApi } from "@/application";
import { PublicSiteShell } from "@/presentation/shared";

type PublicCommunityQuery = Pick<ApplicationApi, "getPublicCommunityBySlug">;

export type PublicCommunityPageModel =
  | {
      status: "success";
      community: {
        slug: string;
        name: string;
        description: string;
        visibility: string;
        followerCount: number;
      };
      owner: {
        displayName: string;
        role: string;
        profileSlug: string | null;
      };
      featuredFundraiser: {
        slug: string;
        title: string;
        status: string;
        goalAmount: number;
      } | null;
      discussion: Array<{
        id: string;
        title: string;
        body: string;
        status: string;
        moderationStatus: string;
        authorDisplayName: string;
        createdAt: string;
        comments: Array<{
          id: string;
          body: string;
          moderationStatus: string;
          authorDisplayName: string;
          createdAt: string;
        }>;
      }>;
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
  publicCommunityQuery: PublicCommunityQuery;
};

export const buildPublicCommunityPageModel = async (
  dependencies: BuildDependencies,
  slug: string,
): Promise<PublicCommunityPageModel> => {
  const result = await dependencies.publicCommunityQuery.getPublicCommunityBySlug({
    slug,
  });

  switch (result.status) {
    case "success":
      return {
        status: "success",
        community: result.data.community,
        owner: result.data.owner,
        featuredFundraiser: result.data.featuredFundraiser,
        discussion: result.data.discussion,
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

type PublicCommunityPageProps = {
  model: PublicCommunityPageModel;
};

export const PublicCommunityPage = ({ model }: PublicCommunityPageProps) => {
  if (model.status === "invalid_request") {
    return (
      <PublicSiteShell>
        <main style={pageContainerStyle}>
          <section style={cardStyle}>
            <h1 style={headingStyle}>Invalid community request</h1>
            <p style={bodyTextStyle}>{model.message}</p>
          </section>
        </main>
      </PublicSiteShell>
    );
  }

  if (model.status === "not_found") {
    return (
      <PublicSiteShell>
        <main style={pageContainerStyle}>
          <section style={cardStyle}>
            <h1 style={headingStyle}>Community not found</h1>
            <p style={bodyTextStyle}>
              {model.message} Tried slug: <strong>{model.slug}</strong>
            </p>
          </section>
        </main>
      </PublicSiteShell>
    );
  }

  return (
    <PublicSiteShell>
      <main style={pageContainerStyle}>
        <section style={heroCardStyle}>
          <p style={eyebrowStyle}>Public community</p>
          <h1 style={headingStyle}>{model.community.name}</h1>
          <p style={metaStyle}>
            {toTitleCase(model.community.visibility)} · Followers:{" "}
            {model.community.followerCount}
          </p>
          <p style={bodyTextStyle}>{model.community.description}</p>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionHeadingStyle}>Community owner</h2>
          <p style={bodyTextStyle}>
            {model.owner.displayName} · {toTitleCase(model.owner.role)}
          </p>
          {model.owner.profileSlug ? (
            <a href={`/profiles/${model.owner.profileSlug}`} style={linkStyle}>
              View owner profile
            </a>
          ) : (
            <p style={bodyTextStyle}>Owner profile link not available.</p>
          )}
        </section>

        <section style={cardStyle}>
          <h2 style={sectionHeadingStyle}>Featured fundraiser</h2>
          {model.featuredFundraiser ? (
            <>
              <a
                href={`/fundraisers/${model.featuredFundraiser.slug}`}
                style={linkStyle}
              >
                {model.featuredFundraiser.title}
              </a>
              <p style={bodyTextStyle}>
                {toTitleCase(model.featuredFundraiser.status)} ·{" "}
                {formatCurrency(model.featuredFundraiser.goalAmount)}
              </p>
            </>
          ) : (
            <p style={bodyTextStyle}>No featured fundraiser yet.</p>
          )}
        </section>

        <section style={cardStyle}>
          <h2 style={sectionHeadingStyle}>Discussion feed</h2>
          {model.discussion.length > 0 ? (
            <ul style={postListStyle}>
              {model.discussion.map((post) => (
                <li key={post.id} style={postCardStyle}>
                  <h3 style={postTitleStyle}>{post.title}</h3>
                  <p style={metaStyle}>
                    By {post.authorDisplayName} ·{" "}
                    {new Date(post.createdAt).toLocaleDateString("en-US")}
                  </p>
                  <p style={bodyTextStyle}>{post.body}</p>
                  <p style={helperTextStyle}>
                    Post status: {toTitleCase(post.status)} · Moderation:{" "}
                    {toTitleCase(post.moderationStatus)}
                  </p>

                  <h4 style={commentHeadingStyle}>Comments</h4>
                  {post.comments.length > 0 ? (
                    <ul style={commentListStyle}>
                      {post.comments.map((comment) => (
                        <li key={comment.id} style={commentCardStyle}>
                          <p style={bodyTextStyle}>{comment.body}</p>
                          <p style={helperTextStyle}>
                            {comment.authorDisplayName} ·{" "}
                            {new Date(comment.createdAt).toLocaleDateString("en-US")} ·{" "}
                            {toTitleCase(comment.moderationStatus)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={helperTextStyle}>No comments yet.</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p style={bodyTextStyle}>No discussion posts yet.</p>
          )}
        </section>
      </main>
    </PublicSiteShell>
  );
};

const pageContainerStyle: CSSProperties = {
  display: "grid",
  gap: "20px",
  margin: "0 auto",
  maxWidth: "940px",
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
    "linear-gradient(145deg, rgba(29, 78, 216, 0.10), rgba(16, 185, 129, 0.08))",
};

const eyebrowStyle: CSSProperties = {
  color: "#1d4ed8",
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

const commentHeadingStyle: CSSProperties = {
  fontSize: "1rem",
  margin: "16px 0 8px",
};

const metaStyle: CSSProperties = {
  color: "#344054",
  fontSize: "0.95rem",
  margin: "6px 0 10px",
};

const bodyTextStyle: CSSProperties = {
  color: "#1f2937",
  lineHeight: 1.55,
  margin: "8px 0 0",
};

const helperTextStyle: CSSProperties = {
  color: "#475467",
  fontSize: "0.9rem",
  lineHeight: 1.45,
  margin: "8px 0 0",
};

const linkStyle: CSSProperties = {
  color: "#1d4ed8",
  display: "inline-block",
  fontSize: "1rem",
  fontWeight: 600,
  marginTop: "10px",
  textDecoration: "none",
};

const postListStyle: CSSProperties = {
  display: "grid",
  gap: "14px",
  listStyle: "none",
  margin: "16px 0 0",
  padding: 0,
};

const postCardStyle: CSSProperties = {
  border: "1px solid rgba(16, 24, 40, 0.08)",
  borderRadius: "12px",
  padding: "14px 16px",
};

const postTitleStyle: CSSProperties = {
  fontSize: "1.05rem",
  margin: 0,
};

const commentListStyle: CSSProperties = {
  display: "grid",
  gap: "10px",
  listStyle: "none",
  margin: "8px 0 0",
  padding: 0,
};

const commentCardStyle: CSSProperties = {
  backgroundColor: "rgba(16, 24, 40, 0.03)",
  borderRadius: "10px",
  padding: "10px 12px",
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
