import {
  resolveReport,
  type ModerationSessionViewerGateway,
  type ReportReviewLookup,
  type ReportReviewWriteRepository,
} from "@/application";

describe("resolveReport", () => {
  it("rejects unsupported moderation actions before touching dependencies", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub();
    const reportReviewLookup = createReportReviewLookupStub();
    const reportReviewWriteRepository = createReportReviewWriteRepositoryStub();

    const result = await resolveReport(
      {
        sessionViewerGateway,
        reportReviewLookup,
        reportReviewWriteRepository,
      },
      {
        sessionToken: "demo-moderator-session",
        reportId: "report_123",
        action: "ban",
      },
    );

    expect(result).toEqual({
      status: "invalid_request",
      message: "action must be one of: hide, remove, dismiss.",
    });
    expect(sessionViewerGateway.findViewerBySessionToken).not.toHaveBeenCalled();
    expect(reportReviewLookup.findReportById).not.toHaveBeenCalled();
  });

  it("returns unauthorized when no viewer can be resolved", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub();
    const reportReviewLookup = createReportReviewLookupStub();
    const reportReviewWriteRepository = createReportReviewWriteRepositoryStub();

    const result = await resolveReport(
      {
        sessionViewerGateway,
        reportReviewLookup,
        reportReviewWriteRepository,
      },
      {
        sessionToken: null,
        reportId: "report_123",
        action: "remove",
      },
    );

    expect(result).toEqual({
      status: "unauthorized",
      message:
        "Authentication is required to moderate content. Send the x-session-token header to continue.",
    });
    expect(reportReviewLookup.findReportById).not.toHaveBeenCalled();
  });

  it("returns forbidden for non-owner members", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
    });
    const reportReviewLookup = createReportReviewLookupStub({
      report: {
        id: "report_123",
        reporterUserId: "user_supporter_jordan",
        targetType: "post",
        targetId: "post_kickoff_update",
        reason: "Misinformation",
        status: "submitted",
        createdAt: new Date("2026-03-16T17:30:00.000Z"),
      },
      context: {
        targetType: "post",
        targetId: "post_kickoff_update",
        ownerUserId: "user_organizer_avery",
        moderationStatus: "visible",
      },
    });
    const reportReviewWriteRepository = createReportReviewWriteRepositoryStub();

    const result = await resolveReport(
      {
        sessionViewerGateway,
        reportReviewLookup,
        reportReviewWriteRepository,
      },
      {
        sessionToken: "demo-supporter-session",
        reportId: "report_123",
        action: "remove",
      },
    );

    expect(result).toEqual({
      status: "forbidden",
      message:
        "Only an authorized owner, moderator, or admin can moderate this content.",
    });
    expect(reportReviewWriteRepository.setModerationStatus).not.toHaveBeenCalled();
    expect(reportReviewWriteRepository.setReportStatus).not.toHaveBeenCalled();
  });

  it("updates target and report statuses for moderator removals", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub({
      viewer: {
        userId: "user_moderator_morgan",
        role: "moderator",
      },
    });
    const reportReviewLookup = createReportReviewLookupStub({
      report: {
        id: "report_123",
        reporterUserId: "user_supporter_jordan",
        targetType: "post",
        targetId: "post_kickoff_update",
        reason: "Misinformation",
        status: "submitted",
        createdAt: new Date("2026-03-16T17:30:00.000Z"),
      },
      context: {
        targetType: "post",
        targetId: "post_kickoff_update",
        ownerUserId: "user_organizer_avery",
        moderationStatus: "visible",
      },
    });
    const reportReviewWriteRepository = createReportReviewWriteRepositoryStub();

    const result = await resolveReport(
      {
        sessionViewerGateway,
        reportReviewLookup,
        reportReviewWriteRepository,
      },
      {
        sessionToken: "demo-moderator-session",
        reportId: "report_123",
        action: "remove",
      },
    );

    expect(reportReviewWriteRepository.setModerationStatus).toHaveBeenCalledWith({
      targetType: "post",
      targetId: "post_kickoff_update",
      moderationStatus: "removed",
    });
    expect(reportReviewWriteRepository.setReportStatus).toHaveBeenCalledWith({
      reportId: "report_123",
      status: "actioned",
    });
    expect(result).toEqual({
      status: "success",
      viewer: {
        userId: "user_moderator_morgan",
        role: "moderator",
      },
      resolution: {
        reportId: "report_123",
        action: "remove",
        reportStatus: "actioned",
      },
      target: {
        type: "post",
        id: "post_kickoff_update",
        moderationStatus: "removed",
      },
    });
  });
});

const createSessionViewerGatewayStub = ({
  viewer = null,
}: {
  viewer?: Awaited<
    ReturnType<ModerationSessionViewerGateway["findViewerBySessionToken"]>
  >;
} = {}): ModerationSessionViewerGateway & {
  findViewerBySessionToken: ReturnType<typeof vi.fn>;
} => ({
  findViewerBySessionToken: vi.fn().mockResolvedValue(viewer),
});

const createReportReviewLookupStub = ({
  report = null,
  context = null,
}: {
  report?: Awaited<ReturnType<ReportReviewLookup["findReportById"]>>;
  context?: Awaited<
    ReturnType<ReportReviewLookup["findReportModerationContext"]>
  >;
} = {}): ReportReviewLookup & {
  findReportById: ReturnType<typeof vi.fn>;
  findReportModerationContext: ReturnType<typeof vi.fn>;
} => ({
  findReportById: vi.fn().mockResolvedValue(report),
  findReportModerationContext: vi.fn().mockResolvedValue(context),
});

const createReportReviewWriteRepositoryStub = (): ReportReviewWriteRepository & {
  setModerationStatus: ReturnType<typeof vi.fn>;
  setReportStatus: ReturnType<typeof vi.fn>;
} => ({
  setModerationStatus: vi.fn().mockResolvedValue(undefined),
  setReportStatus: vi.fn().mockResolvedValue(undefined),
});
