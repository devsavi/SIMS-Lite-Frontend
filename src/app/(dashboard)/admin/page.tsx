import { redirect } from "next/navigation";

/**
 * /admin → redirect to /admin/users (primary admin entry point)
 */
export default function AdminIndexPage() {
  redirect("/admin/users");
}
