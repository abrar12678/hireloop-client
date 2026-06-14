import { redirect } from "next/navigation";
import { auth } from "../auth";
import { headers } from "next/headers";

export const getUserSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(), // some endpoints might require headers
  });

  return session?.user || null;
};

export const getUserToken = async () => {
  const session = await auth.api.getSession({
    headers: await headers(), // some endpoints might require headers
  });

  return session?.session?.token || null;
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
