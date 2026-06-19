import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageTab } from "@/components/shell/PageHeader";
import { StatusPill } from "@/components/shell/StatusPill";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { APPROVALS, PURCHASE_ORDERS } from "@/lib/erp-data";
import { useShell } from "@/lib/shell-store";
import { Plus, Filter, Download } from "lucide-react";

export const Route = createFileRoute("/app/procurement/requests")({
  component: ProcurementRequests,
});

const STATUS_TONE = {
  draft: "neutral",
  sent: "info",
  received: "success",
  closed: "neutral",
} as const;

function ProcurementRequests() {
  const { openDrawer } = useShell();
  const requests = APPROVALS.filter(a => a.module === "Procurement");

  return (
    <>
      <PageHeader
        eyebrow="Procurement"
        title="Requisitions & Purchase Orders"
        description="Active procurement workflows and vendor commitments"
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="size-3.5" /> Export</Button>
            <Button size="sm"><Plus className="size-3.5" /> New requisition</Button>
          </>
        }
        tabs={
          <>
            <PageTab active count={requests.length}>Requisitions</PageTab>
            <PageTab count={PURCHASE_ORDERS.length}>Purchase orders</PageTab>
            <PageTab>Receipts</PageTab>
          </>
        }
      />

      <div className="flex-1 overflow-auto scrollbar-thin p-6 space-y-6">
        <section>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Open requisitions
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {requests.map(r => (
              <button
                key={r.id}
                onClick={() => openDrawer(r)}
                className="text-left p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[11px] text-primary">{r.id}</span>
                  <StatusPill tone={r.aiRisk === "high" ? "danger" : "warning"} dot>{r.status.replace("_", " ")}</StatusPill>
                </div>
                <div className="text-sm font-semibold mb-1.5 line-clamp-2">{r.subject}</div>
                <div className="text-[11px] text-muted-foreground">{r.requester} · {r.age} ago</div>
                {r.amount && (
                  <div className="mt-2 font-mono text-sm font-semibold">${r.amount.toLocaleString()}</div>
                )}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Purchase orders
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs"><Filter className="size-3.5" /> Status</Button>
          </div>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface border-b border-border">
                <tr className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 w-8"><Checkbox /></th>
                  {["PO #", "Vendor", "Items", "Total", "Status", "Owner", "ETA"].map(h => (
                    <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {PURCHASE_ORDERS.map(po => (
                  <tr key={po.id} className="hover:bg-surface">
                    <td className="px-4 py-2"><Checkbox /></td>
                    <td className="px-3 py-2 font-mono text-[11px] text-primary">{po.id}</td>
                    <td className="px-3 py-2 text-xs font-medium">{po.vendor}</td>
                    <td className="px-3 py-2 text-xs">{po.items}</td>
                    <td className="px-3 py-2 text-xs font-mono tabular-nums">${po.total.toLocaleString()}</td>
                    <td className="px-3 py-2"><StatusPill tone={STATUS_TONE[po.status]} dot>{po.status}</StatusPill></td>
                    <td className="px-3 py-2 text-xs">{po.owner}</td>
                    <td className="px-3 py-2 text-xs font-mono text-muted-foreground">{po.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
