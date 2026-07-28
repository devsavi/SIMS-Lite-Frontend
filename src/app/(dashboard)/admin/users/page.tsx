import { UsersPage } from "@/features/admin";

export const metadata = {
  title: "User Management | SIMS Lite Administration",
  description: "Manage system users, roles, and access permissions in SIMS Lite.",
};

export default function AdminUsersPage() {
  return <UsersPage />;
}
