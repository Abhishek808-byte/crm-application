import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageTab } from "@/components/shell/PageHeader";
import { StatusPill } from "@/components/shell/StatusPill";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CAMPAIGNS, CONTENT_ITEMS, type Campaign, type CampaignStatus,
} from "@/lib/erp-data";
import {
  Plus, Megaphone, Target, TrendingUp, Users,
  Mail, Share2, AlignLeft, Layout, Newspaper, Globe,
  CheckCircle2, Clock, PauseCircle, FileText,
} from "lucide-react";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/app/marketing")({
  component: Marketing,
});

const STATUS_TONE = {
  active:    "success",
  draft:     "neutral",
  paused:    "warning",
  complete:  "info",
  scheduled: "neutral",
} as const;

const PLATFORM_COLOR: Record<string, string> = {
  LinkedIn: "text-blue-700 bg-blue-50",
  Email:    "text-cyan-700 bg-cyan-50",
  Twitter:  "text-sky-700 bg-sky-50",
  Multi:    "text-violet-700 bg-violet-50",
};

const CONTENT_ICON: Record<string, any> = {
  "LinkedIn Post": Share2,
  "Blog Post":     AlignLeft,
  "Email Copy":    Mail,
  "Ad Copy":       Layout,
  "Newsletter":    Newspaper,
  "Landing Page":  Globe,
};

const CONTENT_STATUS_TONE = {
  draft:      "neutral",
  in_review:  "warning",
  approved:   "info",
  published:  "success",
} as const;

function MetricCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="size-8 rounded-md bg-primary/10 text-primary grid place-items-center">
          <Icon className="size-4" />
        </div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function Marketing() {
  const [tab, setTab] = useState<"campaigns" | "content" | "icp">("campaigns");
  const [campaigns, setCampaigns] = useState<Campaign[]>(CAMPAIGNS);
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");

  const activeCampaigns  = campaigns.filter(c => c.status === "active");
  const totalReach       = campaigns.reduce((s, c) => s + c.reach, 0);
  const totalLeads       = campaigns.reduce((s, c) => s + c.leads, 0);
  const avgConversion    = campaigns.filter(c => c.conversion > 0).length
    ? (campaigns.filter(c => c.conversion > 0).reduce((s, c) => s + c.conversion, 0) / campaigns.filter(c => c.conversion > 0).length).toFixed(2)
    : "0.00";

  const filtered = statusFilter === "all" ? campaigns : campaigns.filter(c => c.status === statusFilter);

  return (
    <>
      <PageHeader
        eyebrow="Revenue · GTM"
        title="Marketing"
        description="Campaigns, content, and ICP targeting"
        actions={<Button size="sm"><Plus className="size-3.5" /> New campaign</Button>}
        tabs={
          <>
            <PageTab active={tab === "campaigns"} count={campaigns.length} onClick={() => setTab("campaigns")}>Campaigns</PageTab>
            <PageTab active={tab === "content"}   count={CONTENT_ITEMS.length} onClick={() => setTab("content")}>Content Hub</PageTab>
            <PageTab active={tab === "icp"}       onClick={() => setTab("icp")}>ICP Scoring</PageTab>
          </>
        }
      />

      {tab === "campaigns" && (
        <div className="flex-1 overflow-auto scrollbar-thin p-6 space-y-5">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard icon={Megaphone}   label="Active campaigns" value={activeCampaigns.length}              sub="Running now" />
            <MetricCard icon={Users}       label="Total reach"      value={`${(totalReach/1000).toFixed(0)}k`}  sub="Across all channels" />
            <MetricCard icon={Target}      label="Leads generated"  value={totalLeads}                          sub="From campaigns" />
            <MetricCard icon={TrendingUp}  label="Avg conversion"   value={`${avgConversion}%`}                 sub="Leads ÷ reach" />
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap">
            {(["all", "active", "draft", "scheduled", "paused", "complete"] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors capitalize ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "all" ? `All (${campaigns.length})` : s}
              </button>
            ))}
          </div>

          {/* Campaigns table */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-surface border-b border-border">
                <tr className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-left">
                  {["Campaign", "Platform", "Status", "Budget", "Reach", "Leads", "Conversion", ""].map(h => (
                    <th key={h} className="px-3 py-2.5 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-surface group">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-md bg-primary/10 text-primary grid place-items-center shrink-0">
                          <Megaphone className="size-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold">{c.name}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PLATFORM_COLOR[c.platform] || "text-muted-foreground bg-muted"}`}>
                        {c.platform}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <StatusPill tone={STATUS_TONE[c.status]} dot>{c.status}</StatusPill>
                    </td>
                    <td className="px-3 py-2 text-xs font-mono">${(c.budget / 1000).toFixed(0)}k</td>
                    <td className="px-3 py-2 text-xs font-mono tabular-nums">
                      {c.reach > 0 ? `${(c.reach / 1000).toFixed(1)}k` : "—"}
                    </td>
                    <td className="px-3 py-2 text-xs font-mono tabular-nums">{c.leads || "—"}</td>
                    <td className="px-3 py-2 text-xs font-mono tabular-nums">
                      {c.conversion > 0 ? `${c.conversion}%` : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        variant="ghost" size="sm"
                        className="h-6 text-[10px] px-2 opacity-0 group-hover:opacity-100"
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "content" && (
        <div className="flex-1 overflow-auto scrollbar-thin p-6 space-y-5">
          {/* Content stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(
              [
                { label: "Published",  count: CONTENT_ITEMS.filter(c => c.status === "published").length,  Icon: CheckCircle2, tone: "success" as const },
                { label: "In review",  count: CONTENT_ITEMS.filter(c => c.status === "in_review").length,  Icon: Clock,        tone: "warning" as const },
                { label: "Approved",   count: CONTENT_ITEMS.filter(c => c.status === "approved").length,   Icon: FileText,     tone: "info" as const    },
                { label: "Draft",      count: CONTENT_ITEMS.filter(c => c.status === "draft").length,      Icon: PauseCircle,  tone: "neutral" as const },
              ]
            ).map(({ label, count, Icon, tone }) => (
              <div key={label} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="size-4 text-muted-foreground" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
                </div>
                <div className="text-2xl font-bold">{count}</div>
              </div>
            ))}
          </div>

          {/* Content list */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-surface border-b border-border">
                <tr className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-left">
                  {["Content", "Type", "Status", "Author", "Date", "Campaign"].map(h => (
                    <th key={h} className="px-3 py-2.5 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {CONTENT_ITEMS.map(item => {
                  const Icon = CONTENT_ICON[item.type] || FileText;
                  return (
                    <tr key={item.id} className="hover:bg-surface">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-md bg-muted grid place-items-center shrink-0">
                            <Icon className="size-3 text-muted-foreground" />
                          </div>
                          <div className="text-xs font-medium max-w-[280px] truncate">{item.title}</div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className="text-[10px]">{item.type}</Badge>
                      </td>
                      <td className="px-3 py-2">
                        <StatusPill tone={CONTENT_STATUS_TONE[item.status]}>{item.status.replace("_", " ")}</StatusPill>
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{item.author}</td>
                      <td className="px-3 py-2 text-xs font-mono text-muted-foreground">{item.date}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{item.campaign || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "icp" && (
        <div className="flex-1 overflow-auto scrollbar-thin p-6 space-y-5">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-sm font-semibold mb-4">ICP Definition</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Firmographics",  items: ["Series A–C funded", "50–1000 employees", "SaaS / Fintech / Healthcare"] },
                { label: "Decision maker", items: ["VP Sales / Marketing", "CTO / Head of Engineering", "RevOps / Demand Gen"] },
                { label: "Signals",        items: ["High intent keyword traffic", "Competitor evaluation", "Tech stack: Salesforce, HubSpot"] },
              ].map(s => (
                <div key={s.label} className="rounded-lg border border-border p-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{s.label}</div>
                  <ul className="space-y-1">
                    {s.items.map(i => (
                      <li key={i} className="text-xs flex items-start gap-1.5">
                        <CheckCircle2 className="size-3 text-success mt-0.5 shrink-0" /> {i}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="text-sm font-semibold mb-3">Score distribution</div>
              <div className="space-y-2">
                {[
                  { range: "High (70–100)", count: 5, pct: 42, tone: "success" },
                  { range: "Medium (40–69)", count: 4, pct: 33, tone: "warning" },
                  { range: "Low (<40)", count: 2, pct: 17, tone: "danger" },
                  { range: "Not scored", count: 1, pct: 8, tone: "neutral" },
                ].map(r => (
                  <div key={r.range}>
                    <div className="flex justify-between mb-0.5">
                      <span className="text-xs text-muted-foreground">{r.range}</span>
                      <span className="text-xs font-mono">{r.count} · {r.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${r.tone === "success" ? "bg-success" : r.tone === "warning" ? "bg-warning" : r.tone === "danger" ? "bg-destructive" : "bg-muted-foreground"}`}
                        style={{ width: `${r.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-primary/15 bg-primary/[0.03] p-5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
                <Target className="size-3" /> AI ICP Insights
              </div>
              <ul className="space-y-3 text-xs">
                <li><strong>Healthcare vertical</strong> has 18% higher conversion than the baseline ICP.</li>
                <li><strong>Series B companies</strong> with 200–500 employees show highest intent signals this quarter.</li>
                <li>3 contacts scored above 85 have no outreach sequence assigned — consider prioritising.</li>
                <li><strong>Domain enrich</strong> source produces 85% qual rate vs 42% for MongoDB imports.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
