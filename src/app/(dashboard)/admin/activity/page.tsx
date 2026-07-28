import { ActivityLogPage } from "@/features/admin";

export const metadata = {
  title: "Activity Log | SIMS Lite Administration",
  description: "Monitor system events, authentication attempts and administrative operations.",
};

export default function AdminActivityPage() {
  return <ActivityLogPage />;
}
