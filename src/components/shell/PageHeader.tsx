import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow, title, description, actions, tabs,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  tabs?: ReactNode;
}) {
  return (
    <div className="border-b border-border bg-card shrink-0">
      <div className="px-6 pt-4 pb-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70 mb-0.5">
              {eyebrow}
            </div>
          )}
          <h1 className="text-[18px] font-semibold tracking-tight leading-tight truncate">{title}</h1>
          {description && (
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {tabs && (
        <div className="px-6 flex items-center gap-1 -mb-px overflow-x-auto scrollbar-thin">
          {tabs}
        </div>
      )}
    </div>
  );
}

export function PageTab({
  active, count, children, onClick,
}: { active?: boolean; count?: number; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-9 px-3 inline-flex items-center gap-2 text-[12px] font-medium border-b-2 -mb-px transition-colors",
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
      {typeof count === "number" && (
        <span className={cn(
          "text-[10px] font-mono px-1.5 rounded",
          active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}
