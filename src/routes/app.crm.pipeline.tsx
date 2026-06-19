import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageTab } from "@/components/shell/PageHeader";
import { StatusPill } from "@/components/shell/StatusPill";
import { Button } from "@/components/ui/button";
import {
  CONTACTS, PIPELINE_STAGES, STAGE_META, STAGE_CONVERSIONS,
  type Contact, type ContactStage,
} from "@/lib/erp-data";
import {
  ArrowRight, TrendingUp, Users, ArrowUpRight, Plus,
  MoreHorizontal, Phone, Mail, Calendar,
} from "lucide-react";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/app/crm/pipeline")({
  component: CRMPipeline,
});

function DealCard({ contact, onMove }: { contact: Contact; onMove?: (id: string, stage: ContactStage) => void }) {
  const sm = STAGE_META[contact.stage];
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="bg-card border border-border rounded-lg p-3 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-7 rounded-full bg-primary/10 text-primary grid place-items-center text-[10px] font-semibold shrink-0">
            {contact.initials}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold truncate">{contact.name}</div>
            <div className="text-[10px] text-muted-foreground truncate">{contact.company}</div>
          </div>
        </div>
        <div className="relative shrink-0 ml-1">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
            className="size-5 rounded opacity-0 group-hover:opacity-100 hover:bg-muted grid place-items-center text-muted-foreground"
          >
            <MoreHorizontal className="size-3" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-6 z-20 rounded-md border border-border bg-card shadow-md text-xs min-w-[120px]">
              {PIPELINE_STAGES.filter(s => s.key !== contact.stage).map(s => (
                <button
                  key={s.key}
                  className="w-full text-left px-3 py-1.5 hover:bg-surface"
                  onClick={(e) => { e.stopPropagation(); onMove?.(contact.id, s.key); setMenuOpen(false); }}
                >
                  Move → {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground mb-2 truncate">{contact.title}</div>

      <div className="flex items-center justify-between">
        {contact.dealValue
          ? <span className="text-[11px] font-bold font-mono text-foreground">{contact.dealValue}</span>
          : <span />}
        {contact.icpScore > 0 && (
          <StatusPill tone={contact.icpScore >= 70 ? "success" : contact.icpScore >= 40 ? "warning" : "danger"}>
            ICP {contact.icpScore}
          </StatusPill>
        )}
      </div>

      {(contact.closeDate || contact.demoDate || contact.intent) && (
        <div className="mt-2 pt-2 border-t border-border flex items-center gap-2">
          {contact.intent && (
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
              contact.intent === "High" ? "bg-success/15 text-success" :
              contact.intent === "Medium" ? "bg-warning/15 text-warning" :
              "bg-muted text-muted-foreground"
            }`}>
              {contact.intent} intent
            </span>
          )}
          {(contact.closeDate || contact.demoDate) && (
            <span className="text-[9px] text-muted-foreground ml-auto flex items-center gap-0.5">
              <Calendar className="size-2.5" /> {contact.closeDate || contact.demoDate}
            </span>
          )}
        </div>
      )}

      <div className="mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground px-1.5 py-1 rounded hover:bg-muted">
          <Phone className="size-2.5" /> Call
        </button>
        <button className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground px-1.5 py-1 rounded hover:bg-muted">
          <Mail className="size-2.5" /> Email
        </button>
      </div>
    </div>
  );
}

function CRMPipeline() {
  const [view, setView] = useState<"board" | "funnel">("board");
  const [contacts, setContacts] = useState<Contact[]>(CONTACTS);

  function moveContact(id: string, newStage: ContactStage) {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, stage: newStage } : c));
  }

  const stageCounts = useMemo(() => {
    const map: Record<string, number> = {};
    contacts.forEach(c => { map[c.stage] = (map[c.stage] || 0) + 1; });
    return map;
  }, [contacts]);

  const stageValues = useMemo(() => {
    const map: Record<string, number> = {};
    contacts.forEach(c => {
      if (c.dealValue) {
        const n = parseFloat(c.dealValue.replace(/[^0-9.]/g, "")) || 0;
        map[c.stage] = (map[c.stage] || 0) + n;
      }
    });
    return map;
  }, [contacts]);

  const totalActive = contacts.filter(c => !["won", "disqualified"].includes(c.stage)).length;
  const wonCount    = contacts.filter(c => c.stage === "won").length;
  const wonArr      = contacts.filter(c => c.stage === "won" && c.dealValue).reduce((s, c) => {
    return s + (parseFloat((c.dealValue || "").replace(/[^0-9.]/g, "")) || 0);
  }, 0);
  const totalPipeline = contacts.reduce((s, c) => {
    return s + (parseFloat((c.dealValue || "").replace(/[^0-9.]/g, "")) || 0);
  }, 0);

  return (
    <>
      <PageHeader
        eyebrow="CRM · Pipeline"
        title="Pipeline"
        description="Stage-by-stage deal progression and conversion tracking"
        actions={<Button size="sm"><Plus className="size-3.5" /> Add deal</Button>}
        tabs={
          <>
            <PageTab active={view === "board"}  onClick={() => setView("board")}>Board</PageTab>
            <PageTab active={view === "funnel"} onClick={() => setView("funnel")}>Funnel</PageTab>
          </>
        }
      />

      {/* KPI strip */}
      <div className="px-6 py-3 border-b border-border bg-card flex items-center gap-8 shrink-0">
        {[
          { label: "Active leads",    value: totalActive                                    },
          { label: "Won this Q",      value: wonCount                                       },
          { label: "Total pipeline",  value: `$${(totalPipeline / 1000).toFixed(0)}k`       },
          { label: "Closed ARR",      value: wonArr > 0 ? `$${(wonArr / 1000).toFixed(0)}k` : "—" },
        ].map(k => (
          <div key={k.label}>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xl font-bold tabular-nums">{k.value}</span>
              <ArrowUpRight className="size-3.5 text-success" />
            </div>
          </div>
        ))}
      </div>

      {view === "board" ? (
        /* ── KANBAN BOARD ─────────────────────────────────── */
        <div className="flex-1 overflow-x-auto scrollbar-thin">
          <div className="flex gap-3 p-4 h-full" style={{ minWidth: `${PIPELINE_STAGES.length * 220 + 48}px` }}>
            {PIPELINE_STAGES.map(stage => {
              const sm       = STAGE_META[stage.key];
              const cards    = contacts.filter(c => c.stage === stage.key);
              const colValue = stageValues[stage.key] || 0;

              return (
                <div key={stage.key} className="flex flex-col w-52 shrink-0">
                  {/* Column header */}
                  <div className={`rounded-t-lg px-3 py-2 border border-b-0 ${sm.bg} border-border`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${sm.color}`}>
                        {sm.label}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 rounded-full ${sm.color} ${sm.bg}`}>
                        {cards.length}
                      </span>
                    </div>
                    {colValue > 0 && (
                      <div className="text-[10px] font-mono font-semibold text-muted-foreground mt-0.5">
                        ${(colValue / 1000).toFixed(0)}k
                      </div>
                    )}
                  </div>

                  {/* Cards */}
                  <div className="flex-1 overflow-y-auto scrollbar-thin rounded-b-lg border border-border border-t-0 bg-surface/50 p-2 space-y-2 min-h-[200px]">
                    {cards.map(c => (
                      <DealCard key={c.id} contact={c} onMove={moveContact} />
                    ))}
                    {cards.length === 0 && (
                      <div className="text-[10px] text-muted-foreground text-center py-6 border border-dashed border-border rounded-md">
                        No deals
                      </div>
                    )}
                    <button className="w-full text-[10px] text-muted-foreground hover:text-foreground py-1.5 flex items-center justify-center gap-1 rounded hover:bg-muted transition-colors">
                      <Plus className="size-3" /> Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── FUNNEL VIEW ──────────────────────────────────── */
        <div className="flex-1 overflow-auto scrollbar-thin p-6 space-y-6">
          {/* Stage funnel bars */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-sm font-semibold mb-4">Pipeline Funnel</div>
            <div className="flex gap-2 items-stretch">
              {PIPELINE_STAGES.map((s) => {
                const count    = stageCounts[s.key] || 0;
                const maxCount = Math.max(...PIPELINE_STAGES.map(ss => stageCounts[ss.key] || 0), 1);
                const pct      = Math.round((count / maxCount) * 100);
                const sm       = STAGE_META[s.key];
                return (
                  <div key={s.key} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="text-[10px] font-semibold text-center text-muted-foreground px-1 leading-tight">
                      {s.label}
                    </div>
                    <div className="w-full flex flex-col items-center gap-1">
                      <div className="text-xs font-bold">{count}</div>
                      <div className="w-full relative h-32 flex items-end justify-center">
                        <div
                          className={`w-full rounded-t-md transition-all ${sm.bg}`}
                          style={{ height: `${Math.max(pct, 8)}%`, border: "1px solid currentColor", borderBottom: "none" }}
                        />
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${sm.color} ${sm.bg}`}>
                      {s.num}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conversion rates */}
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

          {/* Stage summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PIPELINE_STAGES.map(s => {
              const count    = stageCounts[s.key] || 0;
              const sm       = STAGE_META[s.key];
              const colValue = stageValues[s.key] || 0;
              const avgScore = Math.round(
                contacts.filter(c => c.stage === s.key && c.icpScore > 0)
                  .reduce((a, c) => a + c.icpScore, 0) /
                (contacts.filter(c => c.stage === s.key && c.icpScore > 0).length || 1)
              );
              return (
                <div
                  key={s.key}
                  className="rounded-lg border border-border bg-card p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setView("board")}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sm.color} ${sm.bg}`}>
                      {s.num} · {sm.label}
                    </span>
                  </div>
                  <div className="text-2xl font-bold tabular-nums">{count}</div>
                  {colValue > 0 && (
                    <div className="text-xs font-mono font-semibold text-muted-foreground mt-0.5">
                      ${(colValue / 1000).toFixed(0)}k pipeline
                    </div>
                  )}
                  <div className="text-[11px] text-muted-foreground mt-0.5">{s.description}</div>
                  {avgScore > 0 && (
                    <div className="mt-2">
                      <StatusPill tone={avgScore >= 70 ? "success" : avgScore >= 40 ? "warning" : "danger"}>
                        avg ICP {avgScore}
                      </StatusPill>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
