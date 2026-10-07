"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { navigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function WorkspaceNavigation({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main navigation" className="space-y-2">
      {navigation.map(({ href, label, description, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-3.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-300",
              active
                ? "bg-teal-300/10 text-teal-200"
                : "text-slate-400 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className="size-[18px] shrink-0" aria-hidden="true" />
            <span className="flex-1">
              <span className="block text-sm font-medium">{label}</span>
              <span
                className={cn(
                  "mt-0.5 block text-[11px]",
                  active ? "text-teal-200/60" : "text-slate-500",
                )}
              >
                {description}
              </span>
            </span>
            {active && <ArrowUpRight className="size-3.5" aria-hidden="true" />}
          </Link>
        );
      })}
    </nav>
  );
}
