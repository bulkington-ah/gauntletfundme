import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { CreateCommunityPage } from "@/presentation/communities";

const replaceMock = vi.fn();
const refreshMock = vi.fn();
let fetchMock: ReturnType<typeof vi.fn>;

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
    refresh: refreshMock,
  }),
}));

describe("CreateCommunityPage", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    refreshMock.mockReset();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the create community form", () => {
    render(
      <CreateCommunityPage
        viewer={{
          userId: "user_supporter_jordan",
          role: "supporter",
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Start a public community space" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Community name")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
  });

  it("submits the form and redirects to the new community page", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          community: {
            slug: "jordan-garden-network",
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
      <CreateCommunityPage
        viewer={{
          userId: "user_supporter_jordan",
          role: "supporter",
        }}
      />,
    );

    fireEvent.change(screen.getByLabelText("Community name"), {
      target: {
        value: "Jordan Garden Network",
      },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: {
        value: "Shared planning for pantry beds and community harvests.",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create community" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/communities", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "Jordan Garden Network",
          description: "Shared planning for pantry beds and community harvests.",
        }),
      }),
    );

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith(
        "/communities/jordan-garden-network",
      );
    });
  });

  it("routes back through login when the session expires during submit", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "unauthorized",
          message: "Authentication is required to create communities.",
        }),
        {
          status: 401,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    render(
      <CreateCommunityPage
        viewer={{
          userId: "user_supporter_jordan",
          role: "supporter",
        }}
      />,
    );

    fireEvent.change(screen.getByLabelText("Community name"), {
      target: {
        value: "Jordan Garden Network",
      },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: {
        value: "Shared planning for pantry beds and community harvests.",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create community" }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith(
        "/login?next=%2Fcommunities%2Fcreate",
      );
    });
  });
});
