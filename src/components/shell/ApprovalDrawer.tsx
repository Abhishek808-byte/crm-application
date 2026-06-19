import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useShell } from "@/lib/shell-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, AlertTriangle, MessageSquare, Sparkles, History, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const RISK_COPY: Record<string, { label: string; tone: string }> = {
  low: { label: "Low risk", tone: "text-success" },
  medium: { label: "Medium risk", tone: "text-warning" },
  high: { label: "High risk", tone: "text-destructive" },
};

export function ApprovalDrawer() {
  const { drawerItem, closeDrawer } = useShell();
  const item = drawerItem;

  function decide(kind: "approve" | "reject" | "escalate") {
    if (!item) return;
    toast.success(
      kind === "approve" ? `${item.id} approved` :
      kind === "reject" ? `${item.id} rejected` :
      `${item.id} escalated to CFO`
    );
    closeDrawer();
  }

  return (
    <Sheet open={!!item} onOpenChange={(o) => !o && closeDrawer()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col gap-0">
        {item && (
          <>
            <SheetHeader className="px-5 pt-5 pb-3 border-b border-border space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-primary">{item.id}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.module}</span>
              </div>
              <SheetTitle className="text-base leading-tight">{item.subject}</SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Submitted by {item.requester} · {item.age} ago
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {/* AI summary */}
              <section className="px-5 py-4 border-b border-border bg-surface/60">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="size-3.5 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">AI summary</span>
                </div>
                <p className="text-xs leading-relaxed text-foreground/85">
                  Request aligns with the approved {item.module} OpEx budget. Vendor history clean over the past 18
                  months. Detected <strong>2 similar requisitions</strong> in the same week — consider bundling.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Stat label="Risk" value={RISK_COPY[item.aiRisk].label} tone={RISK_COPY[item.aiRisk].tone} />
                  <Stat label="Budget impact" value="2.4%" />
                  <Stat label="SLA" value="On track" tone="text-success" />
                </div>
              </section>

              <section className="px-5 py-4 border-b border-border">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Policy checks
                </div>
                <ul className="space-y-2 text-xs">
                  <PolicyRow ok label="Within monthly departmental cap" />
                  <PolicyRow ok label="Vendor contract active until 2027" />
                  <PolicyRow ok={item.aiRisk !== "high"} label="No duplicate submissions in 7 days" />
                  <PolicyRow ok label="Two-tier sign-off met (Manager + Finance)" />
                </ul>
              </section>

              <section className="px-5 py-4 border-b border-border">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <History className="size-3" /> Workflow trail
                </div>
                <ol className="space-y-3 text-xs">
                  <TrailRow time={`${item.age} ago`} actor={item.requester} action="submitted request" />
                  <TrailRow time="just now" actor="Workflow Engine" action="routed to Finance approver" />
                  <TrailRow time="awaiting" actor="You" action="decision pending" pending />
                </ol>
              </section>

              <section className="px-5 py-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <MessageSquare className="size-3" /> Add a comment
                </div>
                <Textarea
                  placeholder="Visible to participants…"
                  className="text-xs min-h-[72px]"
                />
              </section>
            </div>

            <div className="border-t border-border p-3 flex flex-col gap-2 bg-card">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => decide("reject")}>
                  Reject
                </Button>
                <Button size="sm" onClick={() => decide("approve")}>
                  <CheckCircle2 className="size-3.5" /> Approve
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={() => decide("escalate")}>
                <AlertTriangle className="size-3.5" /> Escalate to CFO
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value, tone = "text-foreground" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-2">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-xs font-semibold mt-0.5 ${tone}`}>{value}</div>
    </div>
  );
}

function PolicyRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-start gap-2">
      {ok ? (
        <CheckCircle2 className="size-3.5 text-success shrink-0 mt-0.5" />
      ) : (
        <X className="size-3.5 text-destructive shrink-0 mt-0.5" />
      )}
      <span className={ok ? "text-foreground/85" : "text-destructive"}>{label}</span>
    </li>
  );
}

function TrailRow({ time, actor, action, pending = false }: {
  time: string; actor: string; action: string; pending?: boolean;
}) {
  return (
    <li className="relative pl-4 border-l border-border">
      <span className={`absolute -left-[5px] top-1 size-2 rounded-full ${pending ? "bg-warning" : "bg-success"}`} />
      <div className="text-foreground"><strong>{actor}</strong> {action}</div>
      <div className="text-[10px] text-muted-foreground">{time}</div>
    </li>
  );
}
