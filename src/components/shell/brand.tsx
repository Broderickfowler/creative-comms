import { Command } from "lucide-react";

export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-teal-300">
        <Command className="size-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-[15px] font-bold tracking-[0.17em] text-white">
          SEKAIROS
        </p>
        <p className="mt-0.5 text-[9px] font-medium tracking-[0.22em] text-slate-400">
          REVENUE COMMAND
        </p>
      </div>
    </div>
  );
}
