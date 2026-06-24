import { redirect } from "next/navigation";
import { auth } from "../auth";
import { headers } from "next/headers";

const SESSION_TIMEOUT_MS = 5000; // 5 seconds — fail fast instead of hanging forever

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Session check timed out")), ms),
    ),
  ]);
}

export const getUserSession = async () => {
  try {
    const session = await withTimeout(
      auth.api.getSession({ headers: await headers() }),
      SESSION_TIMEOUT_MS,
    );
    return session?.user || null;
  } catch {
    return null; // Timeout or auth error — treat as not logged in
  }
};

export const getUserToken = async () => {
  try {
    const session = await withTimeout(
      auth.api.getSession({ headers: await headers() }),
      SESSION_TIMEOUT_MS,
    );
    return session?.session?.token || null;
  } catch {
    return null;
  }
};

export const requireRole = async (role) => {
  const user = await getUserSession();
  if (!user) {
    redirect("/auth/signIn");
  }
  if (user?.role !== role) {
    redirect("/unauthorized");
  }
  return user;
};