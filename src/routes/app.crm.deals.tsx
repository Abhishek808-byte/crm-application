import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageTab } from "@/components/shell/PageHeader";
import { StatusPill } from "@/components/shell/StatusPill";
import { Button } from "@/components/ui/button";
import { CONTACTS, STAGE_META } from "@/lib/erp-data";
import { Plus, TrendingUp, ArrowUpRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/crm/deals")({
  component: CRMDeals,
});

const DEAL_STAGES = ["proposal_sent", "negotiation", "won"] as const;

function fmtCurrency(v?: string) {
  if (!v) return "—";
  const n = parseFloat(v.replace(/[^0-9.]/g, "")) || 0;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
  return `$${n}`;
}

function fmtDate(d?: string) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }); } catch { return d; }
}

function CRMDeals() {
  const [activeStage, setActiveStage] = useState<string>("all");

  const deals = CONTACTS.filter(c =>
    ["proposal_sent", "negotiation", "won"].includes(c.stage) && c.dealValue
  );

  const filtered = activeStage === "all" ? deals : deals.filter(d => d.stage === activeStage);

  const totalArr = deals.reduce((s, d) => {
    const n = parseFloat((d.dealValue || "").replace(/[^0-9.]/g, "")) || 0;
    return s + n;
  }, 0);

  const wonArr = deals.filter(d => d.stage === "won").reduce((s, d) => {
    const n = parseFloat((d.dealValue || "").replace(/[^0-9.]/g, "")) || 0;
    return s + n;
  }, 0);

  const STAGE_COUNTS = DEAL_STAGES.reduce((acc, s) => {
    acc[s] = deals.filter(d => d.stage === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <PageHeader
        eyebrow="CRM · Pipeline"
        title="Deals"
        description="Active pipeline, forecasts and closed deals"
        actions={
          <Button size="sm">
            <Plus className="size-3.5" /> New deal
          </Button>
        }
        tabs={
          <>
            <PageTab active={activeStage === "all"} count={deals.length} onClick={() => setActiveStage("all")}>All deals</PageTab>
            {DEAL_STAGES.map(s => (
              <PageTab key={s} active={activeStage === s} count={STAGE_COUNTS[s]} onClick={() => setActiveStage(s)}>
                {STAGE_META[s].label}
              </PageTab>
            ))}
          </>
        }
      />

      {/* KPI strip */}
      <div className="px-6 py-3 border-b border-border bg-card flex items-center gap-8">
        {[
          { label: "Total pipeline", value: `$${(totalArr / 1000).toFixed(0)}k`, up: true },
          { label: "Won ARR",        value: `$${(wonArr / 1000).toFixed(0)}k`,   up: true },
          { label: "Open deals",     value: String(deals.filter(d => d.stage !== "won").length), up: false },
          { label: "Avg deal size",  value: deals.length ? `$${Math.round(totalArr / deals.length / 1000)}k` : "—", up: true },
        ].map(k => (
          <div key={k.label}>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xl font-bold tabular-nums">{k.value}</span>
              <ArrowUpRight className={`size-3.5 ${k.up ? "text-success" : "text-muted-foreground"}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Deals table */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-card border-b border-border z-10">
            <tr className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-left">
              {["Deal / Contact", "Company", "Stage", "Value", "Close Date", "ICP", "Intent", ""].map(h => (
                <th key={h} className="px-3 py-2.5 font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-sm text-muted-foreground">
                  No deals in this stage
                </td>
              </tr>
            ) : filtered.map(d => {
              const sm = STAGE_META[d.stage];
              const closeDate = d.stage === "won" ? d.closeDate : (d.closeDate || d.demoDate);
              return (
                <tr key={d.id} className="hover:bg-surface group">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-full bg-primary/10 text-primary grid place-items-center text-[9px] font-semibold shrink-0">
                        {d.initials}
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{d.name}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">{d.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs">{d.company}</td>
                  <td className="px-3 py-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sm.color} ${sm.bg}`}>
                      {sm.label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs font-semibold tabular-nums font-mono">
                    {fmtCurrency(d.dealValue)}
                  </td>
                  <td className="px-3 py-2 text-xs font-mono text-muted-foreground">
                    {fmtDate(closeDate)}
                  </td>
                  <td className="px-3 py-2">
                    {d.icpScore > 0
                      ? <StatusPill tone={d.icpScore >= 70 ? "success" : d.icpScore >= 40 ? "warning" : "danger"}>{d.icpScore}</StatusPill>
                      : <span className="text-xs text-muted-foreground">—</span>
                    }
                  </td>
                  <td className="px-3 py-2">
                    {d.intent && (
                      <StatusPill tone={d.intent === "High" ? "success" : d.intent === "Medium" ? "warning" : "neutral"} dot>
                        {d.intent}
                      </StatusPill>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] px-2 opacity-0 group-hover:opacity-100"
                    >
                      <TrendingUp className="size-3" /> View
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
