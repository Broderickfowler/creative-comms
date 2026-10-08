import { ArrowUpRight } from "lucide-react";
import { Sidebar } from "@/components/shell/sidebar";
import { MobileNavigation } from "@/components/shell/mobile-navigation";
import { Badge } from "@/components/ui/badge";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <a
        data-print-internal
        href="#main-content"
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:translate-y-0"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="app-content lg:ml-64">
        <header
          data-print-internal
          className="flex h-20 items-center justify-between gap-3 border-b bg-white/70 px-5 sm:px-10"
        >
          <div className="flex items-center gap-3">
            <MobileNavigation />
            <span className="text-xs font-medium tracking-wide text-muted-foreground">
              Sekairos <span className="mx-2 text-border">/</span>
              <span className="text-foreground">Revenue Command</span>
            </span>
          </div>
          <Badge
            variant="outline"
            className="gap-2 bg-white px-3 py-1.5 text-[10px] font-medium"
          >
            <span className="size-1.5 rounded-full bg-primary" />
            Revenue workflow v0.3
          </Badge>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto max-w-7xl px-5 py-8 outline-none sm:px-10 sm:py-10"
        >
          {children}
        </main>
        <footer
          data-print-internal
          className="mx-5 flex flex-wrap items-center justify-between gap-2 border-t py-6 text-[10px] text-muted-foreground sm:mx-10"
        >
          <span>SEKAIROS REVENUE COMMAND</span>
          <span className="flex items-center gap-1">
            Built for the next move{" "}
            <ArrowUpRight className="size-3" aria-hidden="true" />
          </span>
        </footer>
      </div>
    </div>
  );
}
