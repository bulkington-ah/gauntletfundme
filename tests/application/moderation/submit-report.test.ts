import {
  submitReport,
  type ModerationSessionViewerGateway,
  type ReportTargetLookup,
  type ReportWriteRepository,
} from "@/application";

describe("submitReport", () => {
  it("rejects invalid target types before touching dependencies", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub();
    const reportTargetLookup = createReportTargetLookupStub();
    const reportWriteRepository = createReportWriteRepositoryStub();

    const result = await submitReport(
      {
        sessionViewerGateway,
        reportTargetLookup,
        reportWriteRepository,
      },
      {
        sessionToken: "demo-supporter-session",
        targetType: "fundraiser",
        targetId: "fundraiser_warm_meals_2026",
        reason: "Off-topic",
      },
    );

    expect(result).toEqual({
      status: "invalid_request",
      message: "targetType must be one of: post, comment.",
    });
    expect(sessionViewerGateway.findViewerBySessionToken).not.toHaveBeenCalled();
    expect(reportTargetLookup.findReportTargetById).not.toHaveBeenCalled();
    expect(reportWriteRepository.createReportIfAbsent).not.toHaveBeenCalled();
  });

  it("returns unauthorized when no viewer can be resolved", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub();
    const reportTargetLookup = createReportTargetLookupStub();
    const reportWriteRepository = createReportWriteRepositoryStub();

    const result = await submitReport(
      {
        sessionViewerGateway,
        reportTargetLookup,
        reportWriteRepository,
      },
      {
        sessionToken: null,
        targetType: "comment",
        targetId: "comment_container_followup",
        reason: "Harassment",
      },
    );

    expect(result).toEqual({
      status: "unauthorized",
      message:
        "Authentication is required to submit reports. Send the x-session-token header to continue.",
    });
    expect(reportTargetLookup.findReportTargetById).not.toHaveBeenCalled();
    expect(reportWriteRepository.createReportIfAbsent).not.toHaveBeenCalled();
  });

  it("returns not_found when target lookup fails", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
    });
    const reportTargetLookup = createReportTargetLookupStub();
    const reportWriteRepository = createReportWriteRepositoryStub();

    const result = await submitReport(
      {
        sessionViewerGateway,
        reportTargetLookup,
        reportWriteRepository,
      },
      {
        sessionToken: "demo-supporter-session",
        targetType: "post",
        targetId: "post_missing",
        reason: "Misinformation",
      },
    );

    expect(result).toEqual({
      status: "not_found",
      message: 'No post was found for id "post_missing".',
    });
    expect(reportWriteRepository.createReportIfAbsent).not.toHaveBeenCalled();
  });

  it("creates or returns idempotent reports for authenticated viewers", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
    });
    const reportTargetLookup = createReportTargetLookupStub({
      target: {
        id: "comment_container_followup",
        targetType: "comment",
      },
    });
    const reportWriteRepository = createReportWriteRepositoryStub({
      created: false,
      report: {
        id: "report_existing_1",
        reporterUserId: "user_supporter_jordan",
        targetType: "comment",
        targetId: "comment_container_followup",
        reason: "Harassment",
        status: "submitted",
        createdAt: new Date("2026-03-16T17:00:00.000Z"),
      },
    });

    const result = await submitReport(
      {
        sessionViewerGateway,
        reportTargetLookup,
        reportWriteRepository,
      },
      {
        sessionToken: "demo-supporter-session",
        targetType: "comment",
        targetId: "comment_container_followup",
        reason: "Harassment",
      },
    );

    expect(reportWriteRepository.createReportIfAbsent).toHaveBeenCalledWith({
      reporterUserId: "user_supporter_jordan",
      targetType: "comment",
      targetId: "comment_container_followup",
      reason: "Harassment",
    });
    expect(result).toEqual({
      status: "success",
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
      report: {
        id: "report_existing_1",
        targetType: "comment",
        targetId: "comment_container_followup",
        reason: "Harassment",
        status: "submitted",
        createdAt: "2026-03-16T17:00:00.000Z",
      },
      created: false,
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

const createReportTargetLookupStub = ({
  target = null,
}: {
  target?: Awaited<ReturnType<ReportTargetLookup["findReportTargetById"]>>;
} = {}): ReportTargetLookup & {
  findReportTargetById: ReturnType<typeof vi.fn>;
} => ({
  findReportTargetById: vi.fn().mockResolvedValue(target),
});

const createReportWriteRepositoryStub = ({
  report = {
    id: "report_default",
    reporterUserId: "user_supporter_jordan",
    targetType: "comment" as const,
    targetId: "comment_container_followup",
    reason: "Harassment",
    status: "submitted" as const,
    createdAt: new Date("2026-03-16T17:00:00.000Z"),
  },
  created = true,
}: {
  report?: Awaited<ReturnType<ReportWriteRepository["createReportIfAbsent"]>>["report"];
  created?: boolean;
} = {}): ReportWriteRepository & {
  createReportIfAbsent: ReturnType<typeof vi.fn>;
} => ({
  createReportIfAbsent: vi.fn().mockResolvedValue({
    report,
    created,
  }),
});
