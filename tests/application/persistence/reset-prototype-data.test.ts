import {
  resetPrototypeData,
  type PrototypeDataResetRepository,
} from "@/application";

describe("resetPrototypeData", () => {
  it("delegates to the reset repository and returns a success message", async () => {
    const prototypeDataResetRepository = createPrototypeDataResetRepositoryStub();

    const result = await resetPrototypeData({
      prototypeDataResetRepository,
    });

    expect(prototypeDataResetRepository.resetPrototypeData).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      status: "success",
      message: "Prototype data reset complete.",
    });
  });
});

const createPrototypeDataResetRepositoryStub = (): PrototypeDataResetRepository & {
  resetPrototypeData: ReturnType<typeof vi.fn>;
} => ({
  resetPrototypeData: vi.fn().mockResolvedValue(undefined),
});
