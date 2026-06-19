import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageTab } from "@/components/shell/PageHeader";
import { StatusPill } from "@/components/shell/StatusPill";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TRANSACTIONS } from "@/lib/erp-data";
import { Filter, Download, Plus, ListFilter, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/finance/transactions")({
  component: Transactions,
});

const STATUS_TONE = {
  verified: "success",
  review: "warning",
  flagged: "danger",
  settled: "neutral",
} as const;

function Transactions() {
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="Transactions"
        description="All ledger entries across vendors and entities"
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="size-3.5" /> Export</Button>
            <Button size="sm"><Plus className="size-3.5" /> New transaction</Button>
          </>
        }
        tabs={
          <>
            <PageTab active={tab === "all"} count={TRANSACTIONS.length} onClick={() => setTab("all")}>All</PageTab>
            <PageTab active={tab === "verified"} onClick={() => setTab("verified")}>Verified</PageTab>
            <PageTab active={tab === "review"} onClick={() => setTab("review")}>In review</PageTab>
            <PageTab active={tab === "flagged"} count={2} onClick={() => setTab("flagged")}>Flagged</PageTab>
          </>
        }
      />

      <div className="px-4 py-3 flex items-center gap-2 border-b border-border bg-card">
        <Button variant="outline" size="sm" className="h-7 text-xs"><ListFilter className="size-3.5" /> Vendor</Button>
        <Button variant="outline" size="sm" className="h-7 text-xs"><Filter className="size-3.5" /> Category</Button>
        <Button variant="outline" size="sm" className="h-7 text-xs"><Filter className="size-3.5" /> Date range</Button>
        {selected.size > 0 && (
          <div className="ml-2 flex items-center gap-2 pl-2 border-l border-border">
            <span className="text-xs text-muted-foreground">{selected.size} selected</span>
            <Button size="sm" className="h-7 text-xs">Reconcile</Button>
          </div>
        )}
        <div className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
          Total: <span className="font-mono text-foreground">${TRANSACTIONS.reduce((s, t) => s + t.amount, 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="sticky top-0 bg-card border-b border-border z-10">
            <tr className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2.5 w-8">
                <Checkbox
                  checked={selected.size > 0 && selected.size === TRANSACTIONS.length}
                  onCheckedChange={() => setSelected(selected.size === TRANSACTIONS.length ? new Set() : new Set(TRANSACTIONS.map(t => t.id)))}
                />
              </th>
              {["ID", "Vendor", "Category", "Date", "Amount", "AI Risk", "Status", "Approver"].map(h => (
                <th key={h} className={cn("px-3 py-2.5 font-semibold whitespace-nowrap", h === "Amount" && "text-right")}>
                  <span className="inline-flex items-center gap-1">{h}<ArrowUpDown className="size-2.5 opacity-50" /></span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {TRANSACTIONS.map(t => (
              <tr key={t.id} className="hover:bg-surface group">
                <td className="px-4 py-2">
                  <Checkbox checked={selected.has(t.id)} onCheckedChange={() => {
                    const next = new Set(selected);
                    next.has(t.id) ? next.delete(t.id) : next.add(t.id);
                    setSelected(next);
                  }} />
                </td>
                <td className="px-3 py-2 font-mono text-[11px] text-primary">{t.id}</td>
                <td className="px-3 py-2 text-xs">
                  <div className="font-medium">{t.vendor}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{t.vendorId}</div>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{t.category}</td>
                <td className="px-3 py-2 text-xs font-mono text-muted-foreground">{t.date}</td>
                <td className="px-3 py-2 text-xs text-right font-mono tabular-nums font-semibold">${t.amount.toLocaleString()}</td>
                <td className="px-3 py-2"><StatusPill tone={t.aiRisk === "high" ? "danger" : t.aiRisk === "medium" ? "warning" : "success"} dot>{t.aiRisk}</StatusPill></td>
                <td className="px-3 py-2"><StatusPill tone={STATUS_TONE[t.status]} dot>{t.status}</StatusPill></td>
                <td className="px-3 py-2 text-xs">{t.approver}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
