import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageTab } from "@/components/shell/PageHeader";
import { StatusPill } from "@/components/shell/StatusPill";
import {
  ArrowUpRight, ArrowDownRight, Sparkles, TrendingUp, ArrowRight,
} from "lucide-react";
import {
  QUALIFICATION_BATCHES, REJECTION_REASONS, SOURCE_QUALITY,
  REVIEWER_PERFORMANCE, STAGE_CONVERSIONS, PIPELINE_STAGES,
  CONTACTS, STAGE_META,
} from "@/lib/erp-data";
import { useState } from "react";

export const Route = createFileRoute("/app/analytics")({
  component: Analytics,
});

const KPIS = [
  { label: "Active pipeline",     value: "9",       delta: "+2 this week",  up: true  },
  { label: "Avg deal velocity",   value: "18 days", delta: "-3d vs Q1",     up: true  },
  { label: "Qual rate (30d)",     value: "63%",     delta: "+5% vs Q1",     up: true  },
  { label: "AI actions",          value: "3,219",   delta: "+412 this week", up: true  },
];

function Analytics() {
  const [tab, setTab] = useState<"overview" | "qualrate" | "rejections" | "sources" | "reviewers" | "pipeline">("overview");

  return (
    <>
      <PageHeader
        eyebrow="CRM · Analytics"
        title="Analytics"
        description="Pipeline performance, lead quality, source attribution and reviewer metrics"
        tabs={
          <>
            <PageTab active={tab === "overview"}    onClick={() => setTab("overview")}>Overview</PageTab>
            <PageTab active={tab === "qualrate"}    onClick={() => setTab("qualrate")}>Qual Rate</PageTab>
            <PageTab active={tab === "rejections"}  onClick={() => setTab("rejections")}>Rejections</PageTab>
            <PageTab active={tab === "sources"}     onClick={() => setTab("sources")}>Sources</PageTab>
            <PageTab active={tab === "reviewers"}   onClick={() => setTab("reviewers")}>Reviewers</PageTab>
            <PageTab active={tab === "pipeline"}    onClick={() => setTab("pipeline")}>Pipeline</PageTab>
          </>
        }
      />

      {tab === "overview" && (
        <div className="flex-1 overflow-auto scrollbar-thin p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {KPIS.map(k => (
              <div key={k.label} className="rounded-lg border border-border bg-card p-4">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
                <div className="text-2xl font-bold mt-1 tabular-nums">{k.value}</div>
                <div className={`text-[11px] mt-1 inline-flex items-center gap-1 ${k.up ? "text-success" : "text-destructive"}`}>
                  {k.up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                  <span>{k.delta}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-semibold">Pipeline velocity</div>
                  <div className="text-xs text-muted-foreground">Lead-to-close trend · last 30 days</div>
                </div>
                <StatusPill tone="success" dot>on track</StatusPill>
              </div>
              <FakeChart />
            </div>

            <div className="rounded-lg border border-primary/15 bg-primary/[0.04] p-5">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary mb-3">
                <Sparkles className="size-3" /> AI insights
              </div>
              <ul className="space-y-3 text-xs">
                <li><strong>Healthcare vertical</strong> leads convert 18% above baseline — prioritise outreach.</li>
                <li><strong>Series B companies</strong> (200–500 employees) show highest intent signals this quarter.</li>
                <li>3 contacts with ICP score &gt;85 have no active sequence assigned.</li>
                <li><strong>Domain enrich</strong> source delivers 2× qual rate vs MongoDB imports.</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="text-sm font-semibold mb-3 inline-flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" /> Win rate by stage entry
              </div>
              <div className="space-y-2.5">
                {[
                  { m: "ICP Scored",    v: 91 },
                  { m: "Qualified",     v: 78 },
                  { m: "Outreach sent", v: 62 },
                  { m: "Response",      v: 54 },
                  { m: "Demo booked",   v: 86 },
                ].map(r => (
                  <div key={r.m}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>{r.m}</span><span className="font-mono text-muted-foreground">{r.v}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${r.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <div className="text-sm font-semibold mb-3">Pipeline bottlenecks</div>
              <ul className="divide-y divide-border text-xs">
                {[
                  { who: "Qualification → Outreach", count: 8, age: "5d avg" },
                  { who: "Response → Demo",          count: 5, age: "3d avg" },
                  { who: "Demo → Won",               count: 3, age: "12d avg" },
                ].map(b => (
                  <li key={b.who} className="py-2.5 flex items-center justify-between">
                    <span>{b.who}</span>
                    <span className="font-mono text-muted-foreground">{b.count} stalled · {b.age}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {tab === "qualrate" && (
        <div className="flex-1 overflow-auto scrollbar-thin p-6 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total reviewed",   value: QUALIFICATION_BATCHES.reduce((s, b) => s + b.total, 0)     },
              { label: "Qualified",        value: QUALIFICATION_BATCHES.reduce((s, b) => s + b.qualified, 0) },
              { label: "Rejected",         value: QUALIFICATION_BATCHES.reduce((s, b) => s + b.rejected, 0)  },
              {
                label: "Avg qual rate",
                value: `${Math.round(QUALIFICATION_BATCHES.reduce((s, b) => s + b.qualPct, 0) / QUALIFICATION_BATCHES.length)}%`,
              },
            ].map(k => (
              <div key={k.label} className="rounded-lg border border-border bg-card p-4">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
                <div className="text-2xl font-bold mt-1 tabular-nums">{k.value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-sm font-semibold mb-4">Qualification rate by batch</div>
            <div className="flex items-end gap-2 h-48">
              {QUALIFICATION_BATCHES.map(b => (
                <div key={b.batch} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[9px] font-mono text-muted-foreground">{b.qualPct}%</div>
                  <div className="w-full flex flex-col gap-px" style={{ height: "180px" }}>
                    <div className="w-full bg-success/20 rounded-t" style={{ height: `${b.qualPct}%` }} />
                    <div className="w-full bg-destructive/20 rounded-b" style={{ height: `${100 - b.qualPct}%` }} />
                  </div>
                  <div className="text-[9px] text-muted-foreground text-center leading-tight">{b.batch.replace("Batch ", "B")}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-success/40 inline-block" /> Qualified</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-destructive/40 inline-block" /> Rejected</span>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-sm font-semibold mb-3">Source breakdown in batches</div>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-left border-b border-border">
                  <th className="pb-2">Batch</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Qualified</th>
                  <th className="pb-2">Rejected</th>
                  <th className="pb-2">Qual %</th>
                  <th className="pb-2">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {QUALIFICATION_BATCHES.map(b => (
                  <tr key={b.batch} className="hover:bg-surface">
                    <td className="py-2 font-mono">{b.batch}</td>
                    <td className="py-2">{b.total}</td>
                    <td className="py-2 text-success">{b.qualified}</td>
                    <td className="py-2 text-destructive">{b.rejected}</td>
                    <td className="py-2">
                      <StatusPill tone={b.qualPct >= 70 ? "success" : b.qualPct >= 50 ? "warning" : "danger"}>
                        {b.qualPct}%
                      </StatusPill>
                    </td>
                    <td className="py-2 text-muted-foreground">{b.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "rejections" && (
        <div className="flex-1 overflow-auto scrollbar-thin p-6 space-y-5">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-sm font-semibold mb-4">Top rejection reasons</div>
            <div className="space-y-3">
              {REJECTION_REASONS.map(r => (
                <div key={r.reason}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">{r.reason}</span>
                    <span className="text-xs font-mono text-muted-foreground">{r.count} · {r.pct}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-destructive/60 rounded-full" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-primary/15 bg-primary/[0.03] p-5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
                <Sparkles className="size-3" /> AI Rejection Insights
              </div>
              <ul className="space-y-3 text-xs">
                <li>Leads from cold email campaigns have 2× higher "budget mismatch" rejection rate.</li>
                <li>Adding a LinkedIn presence check reduces "no online presence" rejections by ~60%.</li>
                <li>Tightening the employee count filter to 50–500 would eliminate most "company too small/large" rejections.</li>
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <div className="text-sm font-semibold mb-3">Rejection count by reason</div>
              <div className="space-y-2 text-xs">
                {REJECTION_REASONS.map(r => (
                  <div key={r.reason} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{r.reason}</span>
                    <StatusPill tone={r.pct >= 25 ? "danger" : r.pct >= 15 ? "warning" : "neutral"}>{r.count}</StatusPill>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "sources" && (
        <div className="flex-1 overflow-auto scrollbar-thin p-6 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SOURCE_QUALITY.map(s => (
              <div key={s.source} className="rounded-lg border border-border bg-card p-4">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{s.source}</div>
                <div className="text-2xl font-bold tabular-nums">{s.qualRate}%</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">qual rate</div>
                <div className="h-1 bg-muted rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.qualRate >= 70 ? "bg-success" : s.qualRate >= 50 ? "bg-warning" : "bg-destructive"}`}
                    style={{ width: `${s.qualRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-surface border-b border-border">
                <tr className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-left">
                  {["Source", "Total", "Qualified", "Rejected", "Qual Rate"].map(h => (
                    <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {SOURCE_QUALITY.map(s => (
                  <tr key={s.source} className="hover:bg-surface">
                    <td className="px-3 py-2 text-xs font-semibold">{s.source}</td>
                    <td className="px-3 py-2 text-xs font-mono">{s.total}</td>
                    <td className="px-3 py-2 text-xs font-mono text-success">{s.qualified}</td>
                    <td className="px-3 py-2 text-xs font-mono text-destructive">{s.rejected}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${s.qualRate >= 70 ? "bg-success" : s.qualRate >= 50 ? "bg-warning" : "bg-destructive"}`}
                            style={{ width: `${s.qualRate}%` }}
                          />
                        </div>
                        <StatusPill tone={s.qualRate >= 70 ? "success" : s.qualRate >= 50 ? "warning" : "danger"}>
                          {s.qualRate}%
                        </StatusPill>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "reviewers" && (
        <div className="flex-1 overflow-auto scrollbar-thin p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REVIEWER_PERFORMANCE.map(r => (
              <div key={r.reviewer} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="size-8 rounded-full bg-primary/10 text-primary grid place-items-center text-[11px] font-bold shrink-0">
                    {r.reviewer.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-xs font-semibold">{r.reviewer}</div>
                    <div className="text-[10px] text-muted-foreground">Reviewer</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold tabular-nums">{r.total}</div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Total</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold tabular-nums text-success">{r.qualified}</div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Qualified</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold tabular-nums text-destructive">{r.rejected}</div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Rejected</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Qual rate</span><span className="font-mono">{r.qualRate}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${r.qualRate >= 70 ? "bg-success" : r.qualRate >= 50 ? "bg-warning" : "bg-destructive"}`}
                      style={{ width: `${r.qualRate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "pipeline" && (
        <div className="flex-1 overflow-auto scrollbar-thin p-6 space-y-5">
          {/* Stage funnel overview */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {PIPELINE_STAGES.map(s => {
              const count = CONTACTS.filter(c => c.stage === s.key).length;
              const sm = STAGE_META[s.key];
              return (
                <div key={s.key} className="rounded-lg border border-border bg-card p-4 text-center">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${sm.color} ${sm.bg}`}>{s.num}</span>
                  <div className="text-xl font-bold tabular-nums mt-2">{count}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{sm.label}</div>
                </div>
              );
            })}
          </div>

          {/* Stage conversion */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-sm font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" /> Stage conversion rates
            </div>
            <div className="flex flex-col gap-3">
              {STAGE_CONVERSIONS.map(c => (
                <div key={c.from}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      {c.from} <ArrowRight className="size-3" /> {c.to}
                    </span>
                    <span className={`text-xs font-mono font-bold ${
                      c.pct >= 80 ? "text-success" : c.pct >= 60 ? "text-primary" : "text-warning"
                    }`}>{c.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        c.pct >= 80 ? "bg-success" : c.pct >= 60 ? "bg-primary" : "bg-warning"
                      }`}
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FakeChart() {
  const bars = [38, 42, 51, 47, 62, 58, 71, 65, 78, 82, 74, 88, 92, 81, 95];
  return (
    <div className="flex items-end gap-1.5 h-40">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-gradient-to-t from-primary/30 to-primary/70 rounded-t"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}
