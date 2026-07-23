/**
 * Main application layout placeholder.
 * Full sidebar + header implementation goes in Phase 1 (Dashboard).
 */
import * as React from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar placeholder */}
      <aside
        aria-label="Application sidebar"
        className="hidden w-64 shrink-0 border-r border-border bg-card md:block"
      />
      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Header placeholder */}
        <header
          className="flex h-14 items-center border-b border-border bg-card px-6"
          role="banner"
        />
        <main className="flex-1 overflow-auto p-6" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
