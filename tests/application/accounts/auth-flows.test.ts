import {
  getSession,
  login,
  logout,
  signUp,
  type AccountAuthRepository,
} from "@/application";
import { createUser } from "@/domain";

describe("account auth flows", () => {
  it("creates an account and session on successful signup", async () => {
    const repository = createAccountAuthRepositoryStub();

    const result = await signUp(
      { accountAuthRepository: repository },
      {
        email: "new.user@example.com",
        displayName: "New User",
        password: "valid-pass-123",
      },
    );

    expect(result.status).toBe("success");
    expect(repository.saveUser).toHaveBeenCalledTimes(1);
    expect(repository.setPasswordCredential).toHaveBeenCalledTimes(1);
    expect(repository.createSession).toHaveBeenCalledTimes(1);
  });

  it("rejects signup when the role is unsupported", async () => {
    const repository = createAccountAuthRepositoryStub();

    const result = await signUp(
      { accountAuthRepository: repository },
      {
        email: "new.user@example.com",
        displayName: "New User",
        password: "valid-pass-123",
        role: "owner",
      },
    );

    expect(result).toEqual({
      status: "invalid_request",
      message: "role must be one of: supporter, organizer, moderator, admin.",
    });
    expect(repository.findUserByEmail).not.toHaveBeenCalled();
  });

  it("returns conflict when signing up with an existing email", async () => {
    const repository = createAccountAuthRepositoryStub({
      userByEmail: createUser({
        id: "user_existing",
        email: "existing@example.com",
        displayName: "Existing User",
        role: "supporter",
        createdAt: new Date("2026-03-16T10:00:00.000Z"),
      }),
    });

    const result = await signUp(
      { accountAuthRepository: repository },
      {
        email: "existing@example.com",
        displayName: "Existing User",
        password: "valid-pass-123",
      },
    );

    expect(result.status).toBe("conflict");
    expect(repository.saveUser).not.toHaveBeenCalled();
  });

  it("logs in and returns unauthorized for invalid credentials", async () => {
    const user = createUser({
      id: "user_123",
      email: "user@example.com",
      displayName: "User",
      role: "supporter",
      createdAt: new Date("2026-03-16T10:00:00.000Z"),
    });
    const repository = createAccountAuthRepositoryStub({
      userByEmail: user,
      passwordMatches: false,
    });

    const failedLogin = await login(
      { accountAuthRepository: repository },
      {
        email: "user@example.com",
        password: "wrong-password",
      },
    );

    expect(failedLogin).toEqual({
      status: "unauthorized",
      message: "Invalid email or password.",
    });

    repository.verifyPasswordCredential.mockResolvedValue(true);
    const successfulLogin = await login(
      { accountAuthRepository: repository },
      {
        email: "user@example.com",
        password: "correct-password",
      },
    );

    expect(successfulLogin.status).toBe("success");
    expect(repository.createSession).toHaveBeenCalledWith("user_123");
  });

  it("logs out and performs session lookups", async () => {
    const repository = createAccountAuthRepositoryStub({
      sessionViewer: {
        userId: "user_123",
        role: "supporter",
      },
    });

    const missingTokenLogout = await logout(
      { accountAuthRepository: repository },
      { sessionToken: null },
    );
    expect(missingTokenLogout).toEqual({
      status: "invalid_request",
      message: "A session token is required to logout.",
    });

    const successfulLogout = await logout(
      { accountAuthRepository: repository },
      { sessionToken: "session_123" },
    );
    expect(successfulLogout.status).toBe("success");
    expect(repository.invalidateSession).toHaveBeenCalledWith("session_123");

    const sessionResult = await getSession(
      { accountAuthRepository: repository },
      { sessionToken: "session_123" },
    );
    expect(sessionResult).toEqual({
      status: "success",
      viewer: {
        userId: "user_123",
        role: "supporter",
      },
    });
  });
});

const createAccountAuthRepositoryStub = ({
  userByEmail = null,
  passwordMatches = true,
  sessionViewer = null,
}: {
  userByEmail?: Awaited<ReturnType<AccountAuthRepository["findUserByEmail"]>>;
  passwordMatches?: Awaited<
    ReturnType<AccountAuthRepository["verifyPasswordCredential"]>
  >;
  sessionViewer?: Awaited<
    ReturnType<AccountAuthRepository["findViewerBySessionToken"]>
  >;
} = {}): AccountAuthRepository & {
  findUserByEmail: ReturnType<typeof vi.fn>;
  saveUser: ReturnType<typeof vi.fn>;
  setPasswordCredential: ReturnType<typeof vi.fn>;
  verifyPasswordCredential: ReturnType<typeof vi.fn>;
  createSession: ReturnType<typeof vi.fn>;
  invalidateSession: ReturnType<typeof vi.fn>;
  findViewerBySessionToken: ReturnType<typeof vi.fn>;
} => ({
  findUserByEmail: vi.fn().mockResolvedValue(userByEmail),
  saveUser: vi.fn().mockResolvedValue(undefined),
  setPasswordCredential: vi.fn().mockResolvedValue(undefined),
  verifyPasswordCredential: vi.fn().mockResolvedValue(passwordMatches),
  createSession: vi.fn().mockResolvedValue("session_123"),
  invalidateSession: vi.fn().mockResolvedValue(undefined),
  findViewerBySessionToken: vi.fn().mockResolvedValue(sessionViewer),
});
