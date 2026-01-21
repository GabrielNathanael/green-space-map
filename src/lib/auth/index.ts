import { getServerSession } from "next-auth";
import { authConfig } from "./config";

// Helper to get current session
export async function getCurrentUser() {
  const session = await getServerSession(authConfig);
  return session?.user;
}

// Helper to check if user is authenticated
export async function isAuthenticated() {
  const session = await getServerSession(authConfig);
  return !!session?.user;
}

// Export auth function for compatibility
export async function auth() {
  return await getServerSession(authConfig);
}
