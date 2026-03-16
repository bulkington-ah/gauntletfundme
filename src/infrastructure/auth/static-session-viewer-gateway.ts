import type { SessionViewerGateway } from "@/application/engagement";
import { getPrototypeCatalog } from "@/infrastructure/demo-data";

export const createStaticSessionViewerGateway = (): SessionViewerGateway => {
  const catalog = getPrototypeCatalog();

  return {
    async findViewerBySessionToken(sessionToken: string | null) {
      if (!sessionToken) {
        return null;
      }

      const userId = catalog.demoSessions[sessionToken];

      if (!userId) {
        return null;
      }

      const user = catalog.users.find((entry) => entry.id === userId);

      return user
        ? {
            userId: user.id,
            role: user.role,
          }
        : null;
    },
  };
};
