import { redirect } from "next/navigation";

/**
 * Root redirect — always send to dashboard.
 * The SessionProvider + ProtectedRoute + GuestRoute handle auth guards.
 */
export default function RootPage() {
  redirect("/dashboard");
}
