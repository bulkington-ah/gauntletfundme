import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const passwordHashLabel = "scrypt";

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16);
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `${passwordHashLabel}$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
};

export const verifyPassword = async (
  password: string,
  passwordHash: string,
): Promise<boolean> => {
  const [algorithm, saltHex, hashHex] = passwordHash.split("$");

  if (algorithm !== passwordHashLabel || !saltHex || !hashHex) {
    return false;
  }

  const salt = Buffer.from(saltHex, "hex");
  const expectedHash = Buffer.from(hashHex, "hex");
  const computedHash = (await scrypt(password, salt, expectedHash.length)) as Buffer;

  if (computedHash.length !== expectedHash.length) {
    return false;
  }

  return timingSafeEqual(computedHash, expectedHash);
};
