import type { Metadata } from "next";
import { UomsPage } from "@/features/master-data/uoms/pages/UomsPage";

export const metadata: Metadata = {
  title: "Units of Measure",
};

export default function Page() {
  return <UomsPage />;
}
