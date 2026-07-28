import * as React from "react";

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The dashboard layout (sidebar + header) is provided by the parent
  // (dashboard) group layout.  This layout exists so that any admin-specific
  // context providers or banners can be added here in the future.
  return <>{children}</>;
}
