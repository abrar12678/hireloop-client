import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Server-side proxy to the backend API.
 *
 * WHY: better-auth sets an httpOnly cookie — client JS cannot read it.
 * So client-side fetch to the backend has no token → backend returns 401 → login loop.
 *
 * This proxy runs SERVER-SIDE, where the httpOnly cookie IS accessible.
 * It reads the session token, then forwards the request to the backend
 * with an Authorization: Bearer header. The backend's verifyToken picks it up.
 */

// Server-only env var (not exposed to client). Falls back to NEXT_PUBLIC_BASE_URL.
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BASE_URL || "";

async function proxyRequest(request, { params }, method) {
  const { path } = await params;
  const pathSegments = Array.isArray(path) ? path.join("/") : path;
  const searchQuery = request.nextUrl.search;

  // 1. Read the httpOnly cookie server-side
  //    ONLY call getSession if a session cookie exists —
  //    saves an unnecessary MongoDB roundtrip for public requests.
  let token = null;
  const hasCookie =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("session_token")?.value ||
    request.cookies.get("token")?.value;

  if (hasCookie) {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      token = session?.session?.token || null;
    } catch (e) {
      // Auth error — continue without token
    }
  }

  // 2. Build backend URL
  const url = `${BACKEND_URL}/api/${pathSegments}${searchQuery}`;

  // 3. Build headers (forward token to backend)
  const forwardHeaders = {};
  if (token) {
    forwardHeaders["Authorization"] = `Bearer ${token}`;
  }

  // 4. Copy content-type for methods with body
  const contentType = request.headers.get("content-type");
  if (contentType && method !== "GET" && method !== "HEAD") {
    forwardHeaders["Content-Type"] = contentType;
  }

  // 5. Build fetch options
  const options = { method, headers: forwardHeaders };
  if (method !== "GET" && method !== "HEAD") {
    options.body = await request.text();
  }

  // 6. Forward to backend
  try {
    const res = await fetch(url, options);
    const contentTypeRes = res.headers.get("content-type");
    const isJson = contentTypeRes && contentTypeRes.includes("application/json");

    const body = isJson ? await res.json() : await res.text();

    return new Response(isJson ? JSON.stringify(body) : body, {
      status: res.status,
      headers: {
        "Content-Type": isJson ? "application/json" : (contentTypeRes || "text/plain"),
      },
    });
  } catch (error) {
    console.error(`[Proxy] Failed to reach backend at: ${url}`, error.message);
    return NextResponse.json(
      { error: "Backend request failed", message: error.message, url },
      { status: 502 }
    );
  }
}

export async function GET(request, context) {
  return proxyRequest(request, context, "GET");
}

export async function POST(request, context) {
  return proxyRequest(request, context, "POST");
}

export async function PUT(request, context) {
  return proxyRequest(request, context, "PUT");
}

export async function DELETE(request, context) {
  return proxyRequest(request, context, "DELETE");
}

export async function PATCH(request, context) {
  return proxyRequest(request, context, "PATCH");
}
