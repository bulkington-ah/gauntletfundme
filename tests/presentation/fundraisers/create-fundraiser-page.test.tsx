import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import {
  CreateFundraiserPage,
  buildCreateFundraiserPageModel,
} from "@/presentation/fundraisers";

const replaceMock = vi.fn();
const refreshMock = vi.fn();
let fetchMock: ReturnType<typeof vi.fn>;

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
    refresh: refreshMock,
  }),
}));

describe("CreateFundraiserPage", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    refreshMock.mockReset();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("builds a page model from the viewer-owned community query", async () => {
    const query = createViewerOwnedCommunityListQueryStub();

    const model = await buildCreateFundraiserPageModel(
      {
        viewerOwnedCommunityListQuery: query,
      },
      "user_supporter_jordan",
    );

    expect(query.listOwnedCommunitiesForViewer).toHaveBeenCalledWith(
      "user_supporter_jordan",
    );
    expect(model).toEqual({
      ownedCommunities: [
        {
          id: "community_jordan_garden_network",
          slug: "jordan-garden-network",
          name: "Jordan Garden Network",
          visibility: "public",
          createdAt: "2026-03-18T15:00:00.000Z",
        },
      ],
    });
  });

  it("renders owned community options and submits the form", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          fundraiser: {
            slug: "spring-pantry-drive",
          },
        }),
        {
          status: 201,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    render(
      <CreateFundraiserPage
        model={{
          ownedCommunities: [
            {
              id: "community_jordan_garden_network",
              slug: "jordan-garden-network",
              name: "Jordan Garden Network",
              visibility: "public",
              createdAt: "2026-03-18T15:00:00.000Z",
            },
          ],
        }}
        viewer={{
          userId: "user_supporter_jordan",
          role: "supporter",
        }}
      />,
    );

    expect(
      screen.getByRole("option", { name: "Jordan Garden Network" }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Fundraiser title"), {
      target: {
        value: "Spring Pantry Drive",
      },
    });
    fireEvent.change(screen.getByLabelText("Story"), {
      target: {
        value: "Funding pantry deliveries through spring.",
      },
    });
    fireEvent.change(screen.getByLabelText("Goal amount (USD)"), {
      target: {
        value: "18000",
      },
    });
    fireEvent.change(screen.getByLabelText("Link to one of your communities"), {
      target: {
        value: "jordan-garden-network",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create fundraiser" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/fundraisers", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: "Spring Pantry Drive",
          story: "Funding pantry deliveries through spring.",
          goalAmount: 18000,
          communitySlug: "jordan-garden-network",
        }),
      }),
    );

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith(
        "/fundraisers/spring-pantry-drive",
      );
    });
  });
});

const createViewerOwnedCommunityListQueryStub = () => ({
  listOwnedCommunitiesForViewer: vi.fn().mockResolvedValue({
    communities: [
      {
        id: "community_jordan_garden_network",
        slug: "jordan-garden-network",
        name: "Jordan Garden Network",
        visibility: "public" as const,
        createdAt: "2026-03-18T15:00:00.000Z",
      },
    ],
  }),
});
