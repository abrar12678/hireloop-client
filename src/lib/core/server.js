import { redirect } from "next/navigation";
import { getUserToken } from "./session";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const authHeader = async () => {
  const token = await getUserToken();
  const header = token ? { authorization: `Bearer ${token}` } : {};
  return header;
};

export const protectedFetch = async (path) => {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: await authHeader(),
  });

  handleStatusCode(res);

  if (!res.ok) {
    console.error(
      `[protectedFetch] ${res.status} ${res.statusText} for ${path}`,
    );
    return [];
  }

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    console.error(
      `[protectedFetch] Expected JSON but got ${contentType} for ${path}`,
    );
    return [];
  }

  return await res.json();
};

export const serverFetch = async (path) => {
  try {
    const res = await fetch(`${baseUrl}${path}`);
    // NO handleStatusCode — public API calls, no redirect on 401
    if (!res.ok) {
      return null;
    }
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return null;
    }
    return await res.json();
  } catch (error) {
    if (error?.message === "NEXT_REDIRECT" || error?.name === "Redirect") {
      throw error;
    }
    return null;
  }
};

export const serverMutation = async (path, data, method = "POST") => {
  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...(await authHeader()),
      },
      body: JSON.stringify(data),
    });

    handleStatusCode(res);

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      console.error(`[serverMutation] ${res.status} for ${path}: ${errorText}`);
      return { error: `Request failed with status ${res.status}` };
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error(
        `[serverMutation] Expected JSON but got ${contentType} for ${path}`,
      );
      return { error: "Invalid response from server" };
    }

    return await res.json();
  } catch (error) {
    if (error?.message === "NEXT_REDIRECT" || error?.name === "Redirect") {
      throw error;
    }
    console.error(`[serverMutation] Failed for ${path}:`, error.message);
    return { error: error.message };
  }
};

const handleStatusCode = (res) => {
  if (res.status === 401) {
    redirect("/auth/signIn");
  } else if (res.status === 403) {
    redirect("/unauthorized");
  }
  return res;
};
