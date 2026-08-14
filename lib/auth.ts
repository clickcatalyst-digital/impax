import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { promisify } from "node:util";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "./db/client";
import { authUsers } from "./db/schema";
import { createSessionValue, SESSION_COOKIE, SESSION_TTL_SECONDS, verifySessionValue } from "./session";

const users = {
  admin: "admin123",
  impax: "impax1",
} as const;

export type AuthUser = { username: keyof typeof users };

const scrypt = promisify(scryptCallback);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return salt + ":" + key.toString("hex");
}

async function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const storedKey = Buffer.from(hash, "hex");
  const suppliedKey = (await scrypt(password, salt, storedKey.length)) as Buffer;
  return storedKey.length === suppliedKey.length && timingSafeEqual(storedKey, suppliedKey);
}

async function getStoredUser(username: keyof typeof users) {
  const [user] = await db.select().from(authUsers).where(eq(authUsers.username, username));
  return user;
}

export async function authenticate(username: string, password: string): Promise<AuthUser | null> {
  if (!(username in users)) return null;
  const validUsername = username as keyof typeof users;
  const storedUser = await getStoredUser(validUsername);

  if (storedUser) {
    return (await verifyPassword(password, storedUser.passwordHash)) ? { username: validUsername } : null;
  }

  if (users[validUsername] !== password) return null;

  await db.insert(authUsers).values({
    username: validUsername,
    passwordHash: await hashPassword(password),
  }).onConflictDoNothing();
  return { username: validUsername };
}

export async function changePassword(username: keyof typeof users, currentPassword: string, nextPassword: string) {
  const storedUser = await getStoredUser(username);
  const currentPasswordIsValid = storedUser
    ? await verifyPassword(currentPassword, storedUser.passwordHash)
    : users[username] === currentPassword;

  if (!currentPasswordIsValid) return { error: "Current password is incorrect." };

  const passwordHash = await hashPassword(nextPassword);
  if (storedUser) {
    await db.update(authUsers).set({ passwordHash }).where(eq(authUsers.username, username));
  } else {
    await db.insert(authUsers).values({ username, passwordHash });
  }
  return { success: "Password updated successfully." };
}

export async function createAuthSession(user: AuthUser) {
  const value = await createSessionValue(user.username);
  cookies().set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
}

export async function clearAuthSession() {
  cookies().delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await verifySessionValue(cookies().get(SESSION_COOKIE)?.value);
  if (!session || !(session.username in users)) return null;
  return { username: session.username as keyof typeof users };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
