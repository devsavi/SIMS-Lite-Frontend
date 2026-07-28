import { NumberingSequencesPage } from "@/features/admin";

export const metadata = {
  title: "Numbering Sequences | SIMS Lite Administration",
  description: "Manage document auto-numbering sequences for Purchase Orders, GRNs and Stock Releases.",
};

export default function AdminSequencesPage() {
  return <NumberingSequencesPage />;
}
