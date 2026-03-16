import { createApplicationApi } from "@/application";

let applicationApi: ReturnType<typeof createApplicationApi> | null = null;

export const getApplicationApi = () => {
  if (!applicationApi) {
    applicationApi = createApplicationApi();
  }

  return applicationApi;
};

export const setApplicationApiForTesting = (
  nextApplicationApi: ReturnType<typeof createApplicationApi>,
) => {
  applicationApi = nextApplicationApi;
};
