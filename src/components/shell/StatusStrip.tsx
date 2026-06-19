import { Activity, Sparkles, RefreshCw } from "lucide-react";

export function StatusStrip() {
  return (
    <footer className="h-7 shrink-0 border-t border-border bg-surface px-3 flex items-center justify-between text-[10px] font-medium text-muted-foreground z-40">
      <div className="flex items-center gap-4">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-success" />
          <span className="uppercase tracking-wider">CRM engine active</span>
        </span>
        <span className="hidden sm:inline-flex items-center gap-1.5">
          <Activity className="size-3" />
          <span className="font-mono">12 contacts synced · 0 errors</span>
        </span>
        <span className="hidden md:inline-flex items-center gap-1.5">
          <Sparkles className="size-3 text-primary" />
          AI assist <span className="font-mono text-foreground/80">v1.4.2-stable</span>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="inline-flex items-center gap-1.5">
          <RefreshCw className="size-3" />
          synced <span className="font-mono text-foreground/80">400ms ago</span>
        </span>
      </div>
    </footer>
  );
}
