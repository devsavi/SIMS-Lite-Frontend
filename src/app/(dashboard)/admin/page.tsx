import { redirect } from "next/navigation";

/**
 * /admin → redirect to /admin/company (primary admin entry point)
 */
export default function AdminIndexPage() {
  redirect("/admin/company");
}
