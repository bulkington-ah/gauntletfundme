import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { PrototypeResetControl } from "@/presentation/prototype";

describe("PrototypeResetControl", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts to the reset endpoint and shows a success message", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "Prototype data reset complete.",
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchSpy);

    render(<PrototypeResetControl />);

    fireEvent.click(screen.getByRole("button", { name: "Reset prototype data" }));

    await waitFor(() =>
      expect(fetchSpy).toHaveBeenCalledWith("/api/prototype/reset", {
        method: "POST",
      }),
    );
    expect(
      await screen.findByRole("status"),
    ).toHaveTextContent("Prototype data reset complete.");
  });

  it("shows inline errors when reset fails", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "We couldn't reset demo data.",
        }),
        {
          status: 500,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchSpy);

    render(<PrototypeResetControl />);

    fireEvent.click(screen.getByRole("button", { name: "Reset prototype data" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't reset demo data.",
    );
  });
});
