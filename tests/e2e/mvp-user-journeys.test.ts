// @vitest-environment node

import { newDb } from "pg-mem";

import { createApplicationApi } from "@/application";
import {
  createPostgresPublicContentEngagementRepository,
  createStaticSessionViewerGateway,
} from "@/infrastructure";

describe("MVP end-to-end journeys", () => {
  it("supports browse, engagement actions, reporting, and moderation resolution", async () => {
    const applicationApi = createJourneyApplicationApi();

    const publicBefore = await applicationApi.getPublicCommunityBySlug({
      slug: "neighbors-helping-neighbors",
    });
    expect(publicBefore.status).toBe("success");
    if (publicBefore.status !== "success") {
      throw new Error("Expected initial community browse to succeed.");
    }

    const follow = await applicationApi.followTarget({
      sessionToken: "demo-supporter-session",
      targetType: "community",
      targetSlug: "neighbors-helping-neighbors",
    });
    expect(follow.status).toBe("success");
    if (follow.status !== "success") {
      throw new Error("Expected follow action to succeed.");
    }

    const comment = await applicationApi.createComment({
      sessionToken: "demo-supporter-session",
      postId: "post_kickoff_update",
      body: "I can help with Thursday prep as well.",
    });
    expect(comment.status).toBe("success");
    if (comment.status !== "success") {
      throw new Error("Expected comment creation to succeed.");
    }

    const donationIntent = await applicationApi.startDonationIntent({
      sessionToken: "demo-supporter-session",
      fundraiserSlug: "warm-meals-2026",
      amount: 3500,
    });
    expect(donationIntent.status).toBe("success");
    if (donationIntent.status !== "success") {
      throw new Error("Expected donation intent start to succeed.");
    }

    const report = await applicationApi.submitReport({
      sessionToken: "demo-supporter-session",
      targetType: "comment",
      targetId: comment.comment.id,
      reason: "Test moderation lifecycle coverage.",
    });
    expect(report.status).toBe("success");
    if (report.status !== "success") {
      throw new Error("Expected report submission to succeed.");
    }

    const resolution = await applicationApi.resolveReport({
      sessionToken: "demo-moderator-session",
      reportId: report.report.id,
      action: "remove",
    });
    expect(resolution.status).toBe("success");
    if (resolution.status !== "success") {
      throw new Error("Expected report resolution to succeed.");
    }

    const publicAfter = await applicationApi.getPublicCommunityBySlug({
      slug: "neighbors-helping-neighbors",
    });
    expect(publicAfter.status).toBe("success");
    if (publicAfter.status !== "success") {
      throw new Error("Expected final community browse to succeed.");
    }

    const visibleCommentIds = publicAfter.data.discussion.flatMap((entry) =>
      entry.comments.map((commentEntry) => commentEntry.id),
    );

    expect(visibleCommentIds).not.toContain(comment.comment.id);
  });
});

const createJourneyApplicationApi = () => {
  const db = newDb({ autoCreateForeignKeyIndices: true });
  const pg = db.adapters.createPg();
  const pool = new pg.Pool();
  const persistence = createPostgresPublicContentEngagementRepository({
    sqlClient: pool,
  });

  return createApplicationApi({
    publicContentReadRepository: persistence,
    discussionTargetLookup: persistence,
    discussionWriteRepository: persistence,
    donationIntentTargetLookup: persistence,
    donationIntentWriteRepository: persistence,
    reportTargetLookup: persistence,
    reportWriteRepository: persistence,
    reportReviewLookup: persistence,
    reportReviewWriteRepository: persistence,
    followTargetLookup: persistence,
    followOwnerLookup: persistence,
    followWriteRepository: persistence,
    sessionViewerGateway: createStaticSessionViewerGateway(),
  });
};
