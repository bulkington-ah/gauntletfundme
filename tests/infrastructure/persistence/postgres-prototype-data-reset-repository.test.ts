// @vitest-environment node

import { newDb } from "pg-mem";

import {
  createPostgresAccountAuthRepository,
  createPostgresPrototypeDataResetRepository,
  createPostgresPublicContentEngagementRepository,
  prototypeLoginPassword,
} from "@/infrastructure";

describe("PostgresPrototypeDataResetRepository", () => {
  it("restores the prototype catalog and demo credentials", async () => {
    const { authRepository, publicContentRepository, resetRepository } =
      createRepositoryHarness();

    await resetRepository.resetPrototypeData();

    const profileSnapshot = await publicContentRepository.findProfileBySlug({
      slug: "avery-johnson",
    });

    expect(profileSnapshot?.user.displayName).toBe("Avery Johnson");
    expect(
      await authRepository.verifyPasswordCredential(
        "user_organizer_avery",
        prototypeLoginPassword,
      ),
    ).toBe(true);
    expect(
      await authRepository.verifyPasswordCredential(
        "user_supporter_jordan",
        prototypeLoginPassword,
      ),
    ).toBe(true);
  });

  it("clears active auth sessions during reset", async () => {
    const { authRepository, resetRepository } = createRepositoryHarness();

    await resetRepository.resetPrototypeData();
    const sessionToken = await authRepository.createSession("user_organizer_avery");

    expect(await authRepository.findViewerBySessionToken(sessionToken)).toEqual({
      userId: "user_organizer_avery",
      role: "organizer",
    });

    await resetRepository.resetPrototypeData();

    await expect(
      authRepository.findViewerBySessionToken(sessionToken),
    ).resolves.toBeNull();
  });
});

const createRepositoryHarness = () => {
  const db = newDb({ autoCreateForeignKeyIndices: true });
  const pg = db.adapters.createPg();
  const pool = new pg.Pool();

  return {
    authRepository: createPostgresAccountAuthRepository({
      sqlClient: pool,
    }),
    publicContentRepository: createPostgresPublicContentEngagementRepository({
      sqlClient: pool,
    }),
    resetRepository: createPostgresPrototypeDataResetRepository({
      sqlClient: pool,
    }),
  };
};
