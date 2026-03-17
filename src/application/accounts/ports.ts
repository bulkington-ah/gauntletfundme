import type { SessionViewerGateway } from "@/application/engagement";
import type { User } from "@/domain";

export interface AccountAuthRepository extends SessionViewerGateway {
  findUserByEmail(email: string): Promise<User | null>;
  saveUser(user: User): Promise<void>;
  setPasswordCredential(userId: string, password: string): Promise<void>;
  verifyPasswordCredential(userId: string, password: string): Promise<boolean>;
  createSession(userId: string): Promise<string>;
  invalidateSession(sessionToken: string): Promise<void>;
}
