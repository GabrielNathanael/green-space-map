import NextAuth from "next-auth";
import { authConfig } from "./config";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Helper to get current session
export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

// Helper to check if user is authenticated
export async function isAuthenticated() {
  const session = await auth();
  return !!session?.user;
}
