import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionValue, SESSION_COOKIE, SESSION_TTL_SECONDS, verifySessionValue } from "./session";

const users = {
  admin: "admin123",
  impax: "impax1",
} as const;

export type AuthUser = { username: keyof typeof users };

export function authenticate(username: string, password: string): AuthUser | null {
  if (username in users && users[username as keyof typeof users] === password) {
    return { username: username as keyof typeof users };
  }
  return null;
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
