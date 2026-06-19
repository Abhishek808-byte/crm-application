import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "primary";

const TONES: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/15 text-warning-foreground border-warning/25 text-amber-700 dark:text-amber-300",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-info/10 text-info border-info/20 dark:text-info",
  primary: "bg-primary/10 text-primary border-primary/15",
};

export function StatusPill({
  tone = "neutral", children, dot = false,
}: { tone?: Tone; children: React.ReactNode; dot?: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 h-5 px-2 rounded text-[10px] font-semibold uppercase tracking-wider border",
      TONES[tone]
    )}>
      {dot && <span className={cn(
        "size-1.5 rounded-full",
        tone === "success" && "bg-success",
        tone === "warning" && "bg-warning",
        tone === "danger" && "bg-destructive",
        tone === "info" && "bg-info",
        tone === "primary" && "bg-primary",
        tone === "neutral" && "bg-muted-foreground",
      )} />}
      {children}
    </span>
  );
}
