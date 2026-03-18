// @vitest-environment node

import { newDb } from "pg-mem";

import { createApplicationApi } from "@/application";
import {
  createPostgresPrototypeDataResetRepository,
  createPostgresPublicContentEngagementRepository,
  createStaticSessionViewerGateway,
} from "@/infrastructure";

describe("MVP end-to-end journeys", () => {
  it("supports browse, engagement actions, reporting, and moderation resolution", async () => {
    const applicationApi = await createJourneyApplicationApi();

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

    const fundraiserBefore = await applicationApi.getPublicFundraiserBySlug({
      slug: "warm-meals-2026",
    });
    const profileBefore = await applicationApi.getPublicProfileBySlug({
      slug: "avery-johnson",
    });
    if (fundraiserBefore.status !== "success" || profileBefore.status !== "success") {
      throw new Error("Expected fundraiser and profile reads to succeed before donating.");
    }

    const donation = await applicationApi.submitDonation({
      sessionToken: "demo-supporter-session",
      fundraiserSlug: "warm-meals-2026",
      amount: 3500,
    });
    expect(donation.status).toBe("success");
    if (donation.status !== "success") {
      throw new Error("Expected donation submission to succeed.");
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
    const fundraiserAfter = await applicationApi.getPublicFundraiserBySlug({
      slug: "warm-meals-2026",
    });
    const profileAfter = await applicationApi.getPublicProfileBySlug({
      slug: "avery-johnson",
    });
    expect(publicAfter.status).toBe("success");
    expect(fundraiserAfter.status).toBe("success");
    expect(profileAfter.status).toBe("success");
    if (
      publicAfter.status !== "success" ||
      fundraiserAfter.status !== "success" ||
      profileAfter.status !== "success"
    ) {
      throw new Error("Expected final public reads to succeed.");
    }

    const visibleCommentIds = publicAfter.data.discussion.flatMap((entry) =>
      entry.comments.map((commentEntry) => commentEntry.id),
    );

    expect(visibleCommentIds).not.toContain(comment.comment.id);
    expect(fundraiserAfter.data.fundraiser.amountRaised).toBe(
      fundraiserBefore.data.fundraiser.amountRaised + 3500,
    );
    expect(fundraiserAfter.data.fundraiser.donationCount).toBe(
      fundraiserBefore.data.fundraiser.donationCount + 1,
    );
    expect(publicAfter.data.community.amountRaised).toBe(
      publicBefore.data.community.amountRaised + 3500,
    );
    expect(publicAfter.data.community.donationCount).toBe(
      publicBefore.data.community.donationCount + 1,
    );
    expect(profileAfter.data.recentActivity[0]?.type).toBe("fundraiser_donation");
    expect(profileAfter.data.recentActivity[0]?.amount).toBe(3500);
  });
});

const createJourneyApplicationApi = async () => {
  const db = newDb({ autoCreateForeignKeyIndices: true });
  const pg = db.adapters.createPg();
  const pool = new pg.Pool();
  const persistence = createPostgresPublicContentEngagementRepository({
    sqlClient: pool,
  });
  const resetRepository = createPostgresPrototypeDataResetRepository({
    sqlClient: pool,
  });

  await resetRepository.resetPrototypeData();

  return createApplicationApi({
    publicContentReadRepository: persistence,
    discussionTargetLookup: persistence,
    discussionWriteRepository: persistence,
    donationTargetLookup: persistence,
    donationWriteRepository: persistence,
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
