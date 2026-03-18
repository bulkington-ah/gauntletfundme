describe("create route pages", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock("next/navigation");
    vi.doUnmock("@/application");
    vi.doUnmock("@/presentation/auth");
  });

  it("redirects anonymous community-create visits into login", async () => {
    const redirectMock = vi.fn(() => {
      throw new Error("NEXT_REDIRECT");
    });
    const createApplicationApiMock = vi.fn().mockReturnValue({});
    const viewerStateMock = vi.fn().mockResolvedValue({
      viewer: null,
      viewerProfileSlug: null,
    });

    vi.doMock("next/navigation", () => ({
      redirect: redirectMock,
    }));
    vi.doMock("@/application", () => ({
      createApplicationApi: createApplicationApiMock,
    }));
    vi.doMock("@/presentation/auth", () => ({
      getPublicShellViewerStateFromBrowserSession: viewerStateMock,
    }));

    const { default: CommunityCreateRoutePage } = await import(
      "@/app/communities/create/page"
    );

    await expect(CommunityCreateRoutePage()).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith(
      "/login?next=%2Fcommunities%2Fcreate",
    );
  });

  it("redirects anonymous fundraiser-create visits into login", async () => {
    const redirectMock = vi.fn(() => {
      throw new Error("NEXT_REDIRECT");
    });
    const createApplicationApiMock = vi.fn().mockReturnValue({});
    const viewerStateMock = vi.fn().mockResolvedValue({
      viewer: null,
      viewerProfileSlug: null,
    });

    vi.doMock("next/navigation", () => ({
      redirect: redirectMock,
    }));
    vi.doMock("@/application", () => ({
      createApplicationApi: createApplicationApiMock,
    }));
    vi.doMock("@/presentation/auth", () => ({
      getPublicShellViewerStateFromBrowserSession: viewerStateMock,
    }));

    const { default: FundraiserCreateRoutePage } = await import(
      "@/app/fundraisers/create/page"
    );

    await expect(FundraiserCreateRoutePage()).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith(
      "/login?next=%2Ffundraisers%2Fcreate",
    );
  });
});
