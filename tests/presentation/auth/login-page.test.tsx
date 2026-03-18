import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { LoginPage } from "@/presentation/auth";

const replaceMock = vi.fn();
const refreshMock = vi.fn();
let fetchMock: ReturnType<typeof vi.fn>;

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
    refresh: refreshMock,
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    refreshMock.mockReset();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the login form and return path copy", () => {
    render(<LoginPage nextPath="/fundraisers/warm-meals-2026" />);

    expect(
      screen.getByRole("heading", { name: "Sign in to gauntletfundme" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/You'll return to/),
    ).toBeInTheDocument();
    expect(screen.getByText("/fundraisers/warm-meals-2026")).toBeInTheDocument();
  });

  it("surfaces invalid credential errors from the login API", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "unauthorized",
          message: "Invalid email or password.",
        }),
        {
          status: 401,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    render(<LoginPage nextPath="/profiles/avery-johnson" />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: {
        value: "avery.organizer@example.com",
      },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: {
        value: "wrong-password",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Invalid email or password.",
      );
    });
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("surfaces a generic request error for unexpected login failures", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "internal_error",
        }),
        {
          status: 500,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    render(<LoginPage nextPath="/profiles/avery-johnson" />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: {
        value: "avery.organizer@example.com",
      },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: {
        value: "Prototype123!",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "We couldn't sign you in right now. Please try again.",
      );
    });
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("navigates to the safe next path after a successful login", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          viewer: {
            userId: "user_organizer_avery",
            role: "organizer",
          },
          sessionToken: "session_123",
          meta: {
            sessionTokenHeader: "x-session-token",
          },
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    render(<LoginPage nextPath="/communities/neighbors-helping-neighbors" />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: {
        value: "avery.organizer@example.com",
      },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: {
        value: "Prototype123!",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith(
        "/communities/neighbors-helping-neighbors",
      );
    });
  });
});
