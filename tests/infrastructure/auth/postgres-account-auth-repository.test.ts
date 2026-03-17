// @vitest-environment node

import { newDb } from "pg-mem";

import { createPostgresAccountAuthRepository } from "@/infrastructure";
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
});

const createRepository = () => {
  const db = newDb({ autoCreateForeignKeyIndices: true });
  const pg = db.adapters.createPg();
  const pool = new pg.Pool();

  return createPostgresAccountAuthRepository({
    sqlClient: pool,
  });
};
