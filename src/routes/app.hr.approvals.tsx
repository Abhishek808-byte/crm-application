import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageTab } from "@/components/shell/PageHeader";
import { StatusPill } from "@/components/shell/StatusPill";
import { APPROVALS } from "@/lib/erp-data";
import { useShell } from "@/lib/shell-store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/hr/approvals")({
  component: HRApprovals,
});

function HRApprovals() {
  const { openDrawer } = useShell();
  const items = APPROVALS.filter(a => a.module === "HR");
  return (
    <>
      <PageHeader
        eyebrow="HRMS"
        title="Approval Queue"
        description="People decisions awaiting your sign-off"
        tabs={<><PageTab active count={items.length}>Pending</PageTab><PageTab>History</PageTab></>}
      />
      <div className="flex-1 overflow-auto scrollbar-thin p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => openDrawer(item)}
              className="text-left p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] text-primary">{item.id}</span>
                <StatusPill tone={item.priority === "high" ? "warning" : "neutral"} dot>{item.priority}</StatusPill>
              </div>
              <div className="text-sm font-semibold mb-1">{item.subject}</div>
              <div className="text-[11px] text-muted-foreground mb-3">
                Submitted by {item.requester} · {item.age} ago
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" className="h-7 text-xs">Approve</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs">Reject</Button>
                <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                  {item.amount ? `$${item.amount.toLocaleString()}` : "—"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
