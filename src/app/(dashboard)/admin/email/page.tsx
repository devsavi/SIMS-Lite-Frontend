import { EmailConfigPage } from "@/features/admin";

export const metadata = {
  title: "Email Configuration | SIMS Lite Administration",
  description: "Configure SMTP gateway settings, sender identity and test email connectivity.",
};

export default function AdminEmailPage() {
  return <EmailConfigPage />;
}
