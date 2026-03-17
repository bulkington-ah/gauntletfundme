import { GET } from "@/app/api/health/route";

describe("health route", () => {
  it("returns a healthy status payload", async () => {
    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      status: "ok",
      service: "gofundme-v2",
    });
    expect(typeof payload.timestamp).toBe("string");
  });
});
