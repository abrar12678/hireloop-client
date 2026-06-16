import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// Client-safe base URL: uses the current origin (works on localhost AND Vercel)
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
};

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [
    adminClient()
  ]
});

// Export hooks/helpers from the SAME client (so baseURL is shared)
export const { signIn, signUp, signOut, useSession } = authClient;
