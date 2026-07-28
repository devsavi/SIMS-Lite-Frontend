import { AuditTrailPage } from "@/features/admin";

export const metadata = {
  title: "Audit Trail | SIMS Lite Administration",
  description: "View immutable audit records with full field-level diff history for all data changes.",
};

export default function AdminAuditPage() {
  return <AuditTrailPage />;
}
