import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

export async function GET(request, context) {
  try {
    const response = await handler.GET(request, context);
    return response;
  } catch (error) {
    console.error("[auth GET]", error?.message || error);
    return new Response(
      JSON.stringify({ error: "Auth handler failed", detail: error?.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

export async function POST(request, context) {
  try {
    const response = await handler.POST(request, context);
    return response;
  } catch (error) {
    console.error("[auth POST]", error?.message || error);
    return new Response(
      JSON.stringify({ error: "Auth handler failed", detail: error?.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}