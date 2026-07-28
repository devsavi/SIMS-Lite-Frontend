import { SystemSettingsPage } from "@/features/admin";

export const metadata = {
  title: "System Settings | SIMS Lite Administration",
  description: "Configure global system parameters, inventory rules, procurement limits and notification preferences.",
};

export default function AdminSettingsPage() {
  return <SystemSettingsPage />;
}
