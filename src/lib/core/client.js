/**
 * Client-safe fetch utilities for "use client" components.
 *
 * PROBLEM: better-auth cookie is httpOnly — JS cannot read it.
 * SOLUTION: All API calls go through our server-side proxy at /api/backend/*,
 * which reads the httpOnly cookie on the server and forwards the request
 * to the backend with an Authorization header.
 *
 * Flow:
 *   Browser → /api/backend/saved-jobs (same-origin, cookie sent)
 *          → Server reads cookie, gets token
 *          → Server → backend/api/saved-jobs (with Authorization header)
 *          → Response back to browser
 */

async function handleResponse(res) {
  if (res.status === 401) {
    // Anti-loop: don't redirect if already on sign-in page
    if (typeof window !== "undefined" && !window.location.pathname.includes("/auth/signIn")) {
      window.location.href = "/auth/signIn";
    }
    return null;
  }
  if (res.status === 403) {
    if (typeof window !== "undefined" && !window.location.pathname.includes("/unauthorized")) {
      window.location.href = "/unauthorized";
    }
    return null;
  }
  if (!res.ok) {
    console.error(`[clientFetch] ${res.status} ${res.statusText} for ${res.url}`);
    return [];
  }
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    console.error(`[clientFetch] Expected JSON but got ${contentType}`);
    return [];
  }
  return await res.json();
}

/**
 * Protected fetch — goes through proxy which adds auth token.
 * Use this for any API that requires authentication.
 */
export const protectedClientFetch = async (apiPath) => {
  // apiPath like "/saved-jobs" or "/subscriptions"
  // Proxy strips /api/ prefix, so we pass just the endpoint path
  const res = await fetch(`/api/backend/${apiPath.replace(/^\/api\//, "")}`, {
    credentials: "include",
  });
  return await handleResponse(res);
};

/**
 * Public fetch — goes through proxy (no auth needed).
 */
export const clientFetch = async (apiPath) => {
  const res = await fetch(`/api/backend/${apiPath.replace(/^\/api\//, "")}`, {
    credentials: "include",
  });
  return await handleResponse(res);
};

/**
 * POST/PUT mutation through proxy.
 */
export const clientMutation = async (apiPath, data, method = "POST") => {
  const res = await fetch(`/api/backend/${apiPath.replace(/^\/api\//, "")}`, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return await handleResponse(res);
};

/**
 * DELETE through proxy.
 */
export const clientDelete = async (apiPath) => {
  const res = await fetch(`/api/backend/${apiPath.replace(/^\/api\//, "")}`, {
    method: "DELETE",
    credentials: "include",
  });
  return await handleResponse(res);
};
