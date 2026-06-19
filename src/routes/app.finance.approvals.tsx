import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageTab } from "@/components/shell/PageHeader";
import { StatusPill } from "@/components/shell/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { APPROVALS, RECENT_ACTIVITY, type ApprovalItem } from "@/lib/erp-data";
import { useShell } from "@/lib/shell-store";
import {
  Filter, Download, Sparkles, ListFilter, ArrowUpDown,
  Layers, AlertTriangle, ChevronDown, CheckCircle2, MessageSquare,
} from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/finance/approvals")({
  component: FinanceApprovals,
});

const STATUS_TONE = {
  pending: "warning",
  in_review: "info",
  flagged: "danger",
  approved: "success",
} as const;

const STATUS_LABEL = {
  pending: "Pending",
  in_review: "In review",
  flagged: "Flagged",
  approved: "Approved",
};

const RISK_TONE = {
  low: "success",
  medium: "warning",
  high: "danger",
} as const;

function FinanceApprovals() {
  const { openDrawer } = useShell();
  const [tab, setTab] = useState<"pending" | "in_review" | "all">("pending");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [density, setDensity] = useState<"compact" | "relaxed">("compact");

  const filtered = useMemo(() => {
    if (tab === "all") return APPROVALS;
    return APPROVALS.filter(a => a.status === tab);
  }, [tab]);

  function toggle(id: string) {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  }
  function toggleAll() {
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(f => f.id)));
  }

  return (
    <>
      <PageHeader
        eyebrow="Finance · Workflow queue"
        title="Approval Queue"
        description="Operational financial flows awaiting decision"
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="size-3.5" /> Export
            </Button>
            <Button size="sm">
              <CheckCircle2 className="size-3.5" /> Batch approve
            </Button>
          </>
        }
        tabs={
          <>
            <PageTab active={tab === "pending"} count={APPROVALS.filter(a => a.status === "pending").length} onClick={() => setTab("pending")}>Pending</PageTab>
            <PageTab active={tab === "in_review"} count={APPROVALS.filter(a => a.status === "in_review").length} onClick={() => setTab("in_review")}>In review</PageTab>
            <PageTab active={tab === "all"} count={APPROVALS.length} onClick={() => setTab("all")}>All</PageTab>
          </>
        }
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Main table area */}
        <section className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* AI banner */}
          <div className="mx-4 mt-4 rounded-lg border border-primary/15 bg-primary/[0.04] px-4 py-2.5 flex items-start gap-3">
            <Sparkles className="size-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 text-xs">
              <span className="font-semibold text-primary">Bottleneck detected.</span>{" "}
              <span className="text-foreground/80">
                Vendor <strong>Acme Logistics</strong> has 14 unapproved invoices this month. Consider batch reconciliation to avoid late fees.
              </span>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs">Analyze batch</Button>
          </div>

          {/* Filter strip */}
          <div className="px-4 py-3 flex items-center gap-2 border-b border-border">
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <ListFilter className="size-3.5" /> Module: All
              <ChevronDown className="size-3" />
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <Filter className="size-3.5" /> Priority: Any
              <ChevronDown className="size-3" />
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <Layers className="size-3.5" /> Saved view: My queue
              <ChevronDown className="size-3" />
            </Button>
            {selected.size > 0 && (
              <div className="ml-2 flex items-center gap-2 pl-2 border-l border-border">
                <span className="text-xs text-muted-foreground">{selected.size} selected</span>
                <Button size="sm" className="h-7 text-xs">Approve</Button>
                <Button variant="outline" size="sm" className="h-7 text-xs">Reject</Button>
              </div>
            )}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Density</span>
              <div className="flex border border-border rounded-md p-0.5 bg-card">
                <button
                  onClick={() => setDensity("compact")}
                  className={cn("px-2 h-6 text-[10px] font-semibold rounded uppercase", density === "compact" ? "bg-muted text-foreground" : "text-muted-foreground")}
                >Compact</button>
                <button
                  onClick={() => setDensity("relaxed")}
                  className={cn("px-2 h-6 text-[10px] font-semibold rounded uppercase", density === "relaxed" ? "bg-muted text-foreground" : "text-muted-foreground")}
                >Relaxed</button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="sticky top-0 bg-card border-b border-border z-10">
                <tr className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 w-8">
                    <Checkbox
                      checked={selected.size > 0 && selected.size === filtered.length}
                      onCheckedChange={toggleAll}
                    />
                  </th>
                  <Th>ID</Th>
                  <Th>Subject</Th>
                  <Th>Module</Th>
                  <Th>Requester</Th>
                  <Th className="text-right">Amount</Th>
                  <Th>AI risk</Th>
                  <Th>Status</Th>
                  <Th>Age</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-surface cursor-pointer group"
                    onClick={() => openDrawer(item)}
                  >
                    <td className={cn("px-4", density === "compact" ? "py-2" : "py-3")} onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selected.has(item.id)} onCheckedChange={() => toggle(item.id)} />
                    </td>
                    <Td className="font-mono text-[11px] text-primary">{item.id}</Td>
                    <Td className="font-medium">{item.subject}</Td>
                    <Td><span className="text-muted-foreground">{item.module}</span></Td>
                    <Td>{item.requester}</Td>
                    <Td className="text-right font-mono tabular-nums">
                      {item.amount ? `$${item.amount.toLocaleString()}` : "—"}
                    </Td>
                    <Td><StatusPill tone={RISK_TONE[item.aiRisk]} dot>{item.aiRisk}</StatusPill></Td>
                    <Td><StatusPill tone={STATUS_TONE[item.status]} dot>{STATUS_LABEL[item.status]}</StatusPill></Td>
                    <Td><span className="font-mono text-[11px] text-muted-foreground">{item.age}</span></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-card">
            <span>Showing 1–{filtered.length} of {filtered.length}</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">‹</Button>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs bg-muted">1</Button>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">2</Button>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">3</Button>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">›</Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn("px-3 py-2.5 font-semibold whitespace-nowrap", className)}>
      <span className="inline-flex items-center gap-1 hover:text-foreground cursor-pointer">
        {children}
        <ArrowUpDown className="size-2.5 opacity-50" />
      </span>
    </th>
  );
}
function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("px-3 py-2 text-xs", className)}>{children}</td>;
}

function QueueCard({ item, active, onOpen }: { item: ApprovalItem; active?: boolean; onOpen: () => void }) {
  const tone = item.priority === "critical" ? "border-l-destructive" : item.priority === "high" ? "border-l-warning" : "border-l-border";
  return (
    <button
      onClick={onOpen}
      className={cn(
        "w-full text-left px-3 py-2.5 border-b border-border border-l-4 transition-colors",
        tone,
        active ? "bg-primary/5" : "hover:bg-card"
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-mono text-primary">{item.id}</span>
        <span className="text-[10px] text-muted-foreground">{item.age} ago</span>
      </div>
      <div className="text-[12px] font-medium leading-snug mb-1 line-clamp-2">{item.subject}</div>
      <div className="text-[10px] text-muted-foreground truncate">
        {item.requester} · {item.amount ? `$${item.amount.toLocaleString()}` : item.module}
      </div>
      {item.aiRisk === "high" && (
        <div className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-semibold text-destructive">
          <AlertTriangle className="size-2.5" /> AI flagged
        </div>
      )}
    </button>
  );
}
