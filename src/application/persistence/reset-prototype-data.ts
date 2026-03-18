import type { PrototypeDataResetRepository } from "./ports";

export type ResetPrototypeDataResult = {
  status: "success";
  message: string;
};

type Dependencies = {
  prototypeDataResetRepository: PrototypeDataResetRepository;
};

export const resetPrototypeData = async (
  dependencies: Dependencies,
): Promise<ResetPrototypeDataResult> => {
  await dependencies.prototypeDataResetRepository.resetPrototypeData();

  return {
    status: "success",
    message: "Prototype data reset complete.",
  };
};
