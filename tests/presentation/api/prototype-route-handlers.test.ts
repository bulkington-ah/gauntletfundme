import { createApplicationApi } from "@/application";
import {
  handlePostResetPrototypeDataRoute,
  setApplicationApiForTesting,
} from "@/presentation/api";

describe("prototype reset API route handler", () => {
  it("returns 200 for a successful anonymous reset", async () => {
    setApplicationApiForTesting(createApplicationApiStub());

    const response = await handlePostResetPrototypeDataRoute();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      message: "Prototype data reset complete.",
    });
  });

  it("returns 500 when reset fails", async () => {
    setApplicationApiForTesting(
      createApplicationApiStub({
        resetPrototypeData: vi.fn().mockRejectedValue(new Error("boom")),
      }),
    );

    const response = await handlePostResetPrototypeDataRoute();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "internal_error",
      message: "We couldn't reset the prototype data right now. Please try again.",
    });
  });
});

const createApplicationApiStub = ({
  resetPrototypeData = vi.fn().mockResolvedValue({
    status: "success" as const,
    message: "Prototype data reset complete.",
  }),
}: {
  resetPrototypeData?: ReturnType<typeof vi.fn>;
} = {}): ReturnType<typeof createApplicationApi> => ({
  signUp: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  getSession: vi.fn(),
  resetPrototypeData,
  getPublicProfileBySlug: vi.fn(),
  getPublicProfileSlugByUserId: vi.fn(),
  getPublicFundraiserBySlug: vi.fn(),
  getPublicCommunityBySlug: vi.fn(),
  listPublicFundraisers: vi.fn(),
  listPublicCommunities: vi.fn(),
  createPost: vi.fn(),
  createComment: vi.fn(),
  submitDonation: vi.fn(),
  startDonationIntent: vi.fn(),
  submitReport: vi.fn(),
  resolveReport: vi.fn(),
  followTarget: vi.fn(),
  unfollowTarget: vi.fn(),
});
