// @vitest-environment node

import { newDb } from "pg-mem";

import {
  createPostgresAccountAuthRepository,
  createPostgresPrototypeDataResetRepository,
  prototypeLoginPassword,
} from "@/infrastructure";
import { createUser } from "@/domain";

describe("PostgresAccountAuthRepository", () => {
  it("creates and looks up users by email", async () => {
    const repository = createRepository();

    const user = createUser({
      id: "user_auth_1",
      email: "auth.user@example.com",
      displayName: "Auth User",
      role: "supporter",
      createdAt: new Date("2026-03-16T08:00:00.000Z"),
    });

    await repository.saveUser(user);

    const found = await repository.findUserByEmail("auth.user@example.com");
    expect(found).not.toBeNull();
    expect(found?.id).toBe("user_auth_1");
  });

  it("stores password credentials and verifies them", async () => {
    const repository = createRepository();

    const user = createUser({
      id: "user_auth_2",
      email: "auth.verify@example.com",
      displayName: "Verify User",
      role: "supporter",
      createdAt: new Date("2026-03-16T08:00:00.000Z"),
    });

    await repository.saveUser(user);
    await repository.setPasswordCredential(user.id, "secure-password");

    expect(
      await repository.verifyPasswordCredential(user.id, "secure-password"),
    ).toBe(true);
    expect(await repository.verifyPasswordCredential(user.id, "wrong-password")).toBe(
      false,
    );
  });

  it("creates, resolves, and invalidates sessions", async () => {
    const repository = createRepository();

    const user = createUser({
      id: "user_auth_3",
      email: "auth.session@example.com",
      displayName: "Session User",
      role: "organizer",
      createdAt: new Date("2026-03-16T08:00:00.000Z"),
    });

    await repository.saveUser(user);
    const sessionToken = await repository.createSession(user.id);

    const viewer = await repository.findViewerBySessionToken(sessionToken);
    expect(viewer).toEqual({
      userId: "user_auth_3",
      role: "organizer",
    });

    await repository.invalidateSession(sessionToken);
    const afterLogout = await repository.findViewerBySessionToken(sessionToken);
    expect(afterLogout).toBeNull();
  });

  it("seeds prototype login credentials for the public demo accounts", async () => {
    const { repository, resetRepository } = createRepositoryHarness();

    await resetRepository.resetPrototypeData();

    const avery = await repository.findUserByEmail("avery.organizer@example.com");
    const jordan = await repository.findUserByEmail("jordan.supporter@example.com");
    const morgan = await repository.findUserByEmail("morgan.moderator@example.com");

    expect(avery?.id).toBe("user_organizer_avery");
    expect(jordan?.id).toBe("user_supporter_jordan");
    expect(morgan?.id).toBe("user_moderator_morgan");

    await expect(
      repository.verifyPasswordCredential(
        "user_organizer_avery",
        prototypeLoginPassword,
      ),
    ).resolves.toBe(true);
    await expect(
      repository.verifyPasswordCredential(
        "user_supporter_jordan",
        prototypeLoginPassword,
      ),
    ).resolves.toBe(true);
    await expect(
      repository.verifyPasswordCredential(
        "user_moderator_morgan",
        prototypeLoginPassword,
      ),
    ).resolves.toBe(true);
  });

  it("seeds prototype login credentials idempotently", async () => {
    const db = newDb({ autoCreateForeignKeyIndices: true });
    const pg = db.adapters.createPg();
    const pool = new pg.Pool();
    const resetRepository = createPostgresPrototypeDataResetRepository({
      sqlClient: pool,
    });

    const firstRepository = createPostgresAccountAuthRepository({
      sqlClient: pool,
    });
    const secondRepository = createPostgresAccountAuthRepository({
      sqlClient: pool,
    });

    await resetRepository.resetPrototypeData();
    await firstRepository.findUserByEmail("avery.organizer@example.com");
    await secondRepository.findUserByEmail("avery.organizer@example.com");

    await expect(
      secondRepository.verifyPasswordCredential(
        "user_organizer_avery",
        prototypeLoginPassword,
      ),
    ).resolves.toBe(true);
  });
});

const createRepository = () => {
  return createRepositoryHarness().repository;
};

const createRepositoryHarness = () => {
  const db = newDb({ autoCreateForeignKeyIndices: true });
  const pg = db.adapters.createPg();
  const pool = new pg.Pool();

  return {
    repository: createPostgresAccountAuthRepository({
      sqlClient: pool,
    }),
    resetRepository: createPostgresPrototypeDataResetRepository({
      sqlClient: pool,
    }),
  };
};
