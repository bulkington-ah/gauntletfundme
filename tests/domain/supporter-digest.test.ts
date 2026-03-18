import { rankSupporterDigestCandidates } from "@/domain";

describe("rankSupporterDigestCandidates", () => {
  it("ranks organizer updates ahead of low-signal discussion bursts", () => {
    const now = new Date("2026-03-18T12:00:00.000Z");

    const ranked = rankSupporterDigestCandidates(
      [
        {
          id: "discussion-burst",
          type: "community_discussion_burst",
          entityKey: "community_post:volunteer-reminder",
          href: "/communities/neighbors-helping-neighbors#post-volunteer-reminder",
          createdAt: new Date("2026-03-18T11:00:00.000Z"),
          communitySlug: "neighbors-helping-neighbors",
          communityName: "Neighbors Helping Neighbors",
          postId: "post_volunteer_reminder",
          postTitle: "Volunteer reminder",
          newCommentCount: 1,
          participantCount: 1,
        },
        {
          id: "organizer-update",
          type: "community_update",
          entityKey: "community_post:kitchen-kickoff",
          href: "/communities/neighbors-helping-neighbors#post-kitchen-kickoff",
          createdAt: new Date("2026-03-18T11:00:00.000Z"),
          communitySlug: "neighbors-helping-neighbors",
          communityName: "Neighbors Helping Neighbors",
          organizerDisplayName: "Avery Johnson",
          postId: "post_kitchen_kickoff",
          postTitle: "Kitchen kickoff update",
        },
      ],
      { now },
    );

    expect(ranked.map((candidate) => candidate.id)).toEqual([
      "organizer-update",
      "discussion-burst",
    ]);
  });

  it("collapses duplicate fundraiser candidates down to the strongest highlight", () => {
    const now = new Date("2026-03-18T12:00:00.000Z");

    const ranked = rankSupporterDigestCandidates(
      [
        {
          id: "momentum",
          type: "fundraiser_momentum",
          entityKey: "fundraiser:warm-meals",
          href: "/fundraisers/warm-meals-2026",
          createdAt: new Date("2026-03-18T11:30:00.000Z"),
          fundraiserSlug: "warm-meals-2026",
          fundraiserTitle: "Warm Meals 2026",
          newDonationCount: 4,
          newAmountRaised: 12000,
          newSupporterCount: 4,
        },
        {
          id: "milestone",
          type: "fundraiser_milestone",
          entityKey: "fundraiser:warm-meals",
          href: "/fundraisers/warm-meals-2026",
          createdAt: new Date("2026-03-18T11:30:00.000Z"),
          fundraiserSlug: "warm-meals-2026",
          fundraiserTitle: "Warm Meals 2026",
          milestonePercent: 50,
          goalAmount: 50000,
          amountRaisedAfterWindow: 26000,
          newDonationCount: 4,
          newAmountRaised: 12000,
        },
      ],
      { now },
    );

    expect(ranked).toHaveLength(1);
    expect(ranked[0]?.id).toBe("milestone");
    expect(ranked[0]?.type).toBe("fundraiser_milestone");
  });

  it("gives milestone crossings more weight than ordinary donation momentum", () => {
    const now = new Date("2026-03-18T12:00:00.000Z");

    const ranked = rankSupporterDigestCandidates(
      [
        {
          id: "momentum",
          type: "fundraiser_momentum",
          entityKey: "fundraiser:fridge-expansion",
          href: "/fundraisers/community-fridge-expansion",
          createdAt: new Date("2026-03-18T11:45:00.000Z"),
          fundraiserSlug: "community-fridge-expansion",
          fundraiserTitle: "Community Fridge Expansion",
          newDonationCount: 3,
          newAmountRaised: 7000,
          newSupporterCount: 3,
        },
        {
          id: "milestone",
          type: "fundraiser_milestone",
          entityKey: "fundraiser:warm-meals",
          href: "/fundraisers/warm-meals-2026",
          createdAt: new Date("2026-03-18T11:00:00.000Z"),
          fundraiserSlug: "warm-meals-2026",
          fundraiserTitle: "Warm Meals 2026",
          milestonePercent: 25,
          goalAmount: 100000,
          amountRaisedAfterWindow: 28000,
          newDonationCount: 2,
          newAmountRaised: 8000,
        },
      ],
      { now },
    );

    expect(ranked.map((candidate) => candidate.id)).toEqual([
      "milestone",
      "momentum",
    ]);
  });
});
