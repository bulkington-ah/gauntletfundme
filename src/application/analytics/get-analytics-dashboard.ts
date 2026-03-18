import type { AnalyticsDashboard, AnalyticsDashboardQuery } from "./ports";

type Dependencies = {
  analyticsDashboardQuery: AnalyticsDashboardQuery;
};

export const getAnalyticsDashboard = async (
  dependencies: Dependencies,
): Promise<AnalyticsDashboard> => {
  return dependencies.analyticsDashboardQuery.getDashboard();
};
