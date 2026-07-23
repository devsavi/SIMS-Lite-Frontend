/**
 * Temporary landing page for Phase 0 validation.
 * Will be replaced with a redirect to /dashboard once auth is implemented.
 */
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";

const checks = [
  { label: "Next.js App Router", done: true },
  { label: "TypeScript strict mode", done: true },
  { label: "Tailwind CSS v4", done: true },
  { label: "shadcn/ui components", done: true },
  { label: "Dark / light themes", done: true },
  { label: "TanStack Query", done: true },
  { label: "Zustand stores", done: true },
  { label: "API client (Axios)", done: true },
  { label: "Environment validation", done: true },
  { label: "Folder architecture", done: true },
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            SIMS Lite
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enterprise Inventory Management — Phase 0 Foundation
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Foundation Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {checks.map((check) => (
                <li key={check.label} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{check.label}</span>
                  <Badge variant={check.done ? "success" : "outline"}>
                    {check.done ? "✓ Ready" : "Pending"}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Phase 0 complete. Proceed to Phase 1: Authentication.
        </p>
      </div>
    </main>
  );
}
