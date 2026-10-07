import { ArrowRight } from "lucide-react";
import { Brand } from "@/components/shell/brand";
import { WorkspaceNavigation } from "@/components/shell/workspace-navigation";

export function Sidebar() {
  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#102522] px-5 py-7 lg:flex"
      aria-label="Workspace sidebar"
    >
      <Brand />
      <p className="mb-4 mt-12 px-3 text-[10px] font-semibold tracking-[0.18em] text-slate-500">
        WORKSPACE
      </p>
      <WorkspaceNavigation />
      <div className="mt-auto">
        <div className="mb-6 rounded-xl border border-white/10 p-4">
          <p className="text-[10px] font-medium tracking-[0.16em] text-teal-300">
            THE OPERATING PRINCIPLE
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Clarity first.
            <br />
            Then the next revenue move.
          </p>
          <ArrowRight
            className="mt-3 size-4 text-teal-300"
            aria-hidden="true"
          />
        </div>
        <div className="flex items-center gap-3 border-t border-white/10 px-1 pt-5">
          <div
            className="flex size-9 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white"
            aria-hidden="true"
          >
            SK
          </div>
          <div>
            <p className="text-xs font-medium text-slate-200">
              Sekairos workspace
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Internal revenue execution
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
