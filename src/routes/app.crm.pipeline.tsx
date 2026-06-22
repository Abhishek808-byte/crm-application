import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageTab } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Play, Pause, Zap, Plus,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/crm/pipeline")({
  component: CRMAutomation,
});

// ── Mock data ──────────────────────────────────────────────────────────────────

type WFStatus = "running" | "paused" | "draft";

interface Workflow {
  id:       string;
  name:     string;
  trigger:  string;
  steps:    number;
  runs24h:  number;
  success?: number;
  status:   WFStatus;
}

const WORKFLOWS: Workflow[] = [
  { id: "WF-1001", name: "Lead Nurture & Email Workflow",  trigger: "Schedule · Daily",            steps: 8,  runs24h: 24,   success: 94.2,  status: "running" },
  { id: "WF-1002", name: "ICP Qualification Engine",       trigger: "Event · New contact added",   steps: 5,  runs24h: 156,  success: 97.8,  status: "running" },
  { id: "WF-1003", name: "Proposal Auto-Generation",       trigger: "Manual · On demand",          steps: 6,  runs24h: 3,    success: 100,   status: "running" },
  { id: "WF-1004", name: "Demo & Meeting Scheduler",       trigger: "Event · Stage → Qualified",   steps: 4,  runs24h: 12,   success: 89.5,  status: "paused"  },
  { id: "WF-1005", name: "Re-engagement Campaign",         trigger: "Schedule · Weekly",           steps: 7,  runs24h: 0,    success: undefined, status: "draft" },
  { id: "WF-1006", name: "Win / Loss Intelligence",        trigger: "Schedule · Monthly",          steps: 9,  runs24h: 0,    success: undefined, status: "draft" },
];

const STATUS_META: Record<WFStatus, { label: string; color: string; bg: string; border: string }> = {
  running: { label: "Running", color: "text-success",          bg: "bg-success/10",          border: "border-success/30"          },
  paused:  { label: "Paused",  color: "text-amber-600",        bg: "bg-amber-50",            border: "border-amber-200"           },
  draft:   { label: "Draft",   color: "text-muted-foreground", bg: "bg-muted",               border: "border-border"              },
};

// ── Table row ──────────────────────────────────────────────────────────────────

function WFRow({
  wf,
  onToggle,
}: {
  wf: Workflow;
  onToggle: (id: string) => void;
}) {
  const meta     = STATUS_META[wf.status];
  const isActive = wf.status !== "draft";

  return (
    <tr className="border-b border-border hover:bg-surface transition-colors group">
      {/* Workflow name + ID */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-primary/8 text-primary grid place-items-center shrink-0">
            <Zap className="size-3.5" />
          </div>
          <div>
            <div className="text-xs font-semibold">{wf.name}</div>
            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{wf.id}</div>
          </div>
        </div>
      </td>

      {/* Trigger */}
      <td className="px-4 py-3.5">
        <span className="text-[11px] text-muted-foreground">{wf.trigger}</span>
      </td>

      {/* Steps */}
      <td className="px-4 py-3.5">
        <span className="text-xs tabular-nums font-medium">{wf.steps}</span>
      </td>

      {/* Runs 24h */}
      <td className="px-4 py-3.5">
        <span className={cn(
          "text-xs tabular-nums font-semibold",
          wf.runs24h > 0 ? "text-foreground" : "text-muted-foreground/50"
        )}>
          {wf.runs24h > 0 ? wf.runs24h.toLocaleString() : "—"}
        </span>
      </td>

      {/* Success */}
      <td className="px-4 py-3.5">
        {wf.success !== undefined ? (
          <span className={cn(
            "text-xs tabular-nums font-semibold",
            wf.success >= 95 ? "text-success" : wf.success >= 80 ? "text-warning" : "text-destructive"
          )}>
            {wf.success}%
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        )}
      </td>

      {/* Status + action */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className={cn(
            "inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide",
            meta.color, meta.bg, meta.border
          )}>
            {wf.status === "running" && (
              <span className="size-1.5 rounded-full bg-current animate-pulse" />
            )}
            {meta.label}
          </span>
          {isActive && (
            <button
              onClick={() => onToggle(wf.id)}
              className="size-7 rounded-md border border-border grid place-items-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
            >
              {wf.status === "running"
                ? <Pause className="size-3.5" />
                : <Play  className="size-3.5" />}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Placeholder for non-list tabs ──────────────────────────────────────────────

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex-1 flex items-center justify-center text-center p-16">
      <div>
        <div className="size-12 rounded-full bg-muted mx-auto grid place-items-center mb-3">
          <Zap className="size-5 text-muted-foreground/40" />
        </div>
        <div className="text-sm font-medium">{title}</div>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">{desc}</p>
        <Button size="sm" variant="outline" className="mt-4" disabled>Coming soon</Button>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

function CRMAutomation() {
  const [tab, setTab]           = useState<"active" | "drafts" | "templates" | "history">("active");
  const [workflows, setWorkflows] = useState<Workflow[]>(WORKFLOWS);

  const active = workflows.filter(w => w.status !== "draft");
  const drafts = workflows.filter(w => w.status === "draft");

  function toggleStatus(id: string) {
    setWorkflows(prev =>
      prev.map(w => w.id === id
        ? { ...w, status: w.status === "running" ? "paused" : "running" }
        : w
      )
    );
  }

  const rows = tab === "active" ? active : tab === "drafts" ? drafts : [];

  return (
    <>
      <PageHeader
        eyebrow="CRM · Automation"
        title="Workflow Automation"
        description="Designer, runtime, and orchestration health"
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus className="size-3.5" /> New Workflow
          </Button>
        }
        tabs={
          <>
            <PageTab active={tab === "active"}    count={active.length} onClick={() => setTab("active")}>Active</PageTab>
            <PageTab active={tab === "drafts"}    count={drafts.length} onClick={() => setTab("drafts")}>Drafts</PageTab>
            <PageTab active={tab === "templates"}               onClick={() => setTab("templates")}>Templates</PageTab>
            <PageTab active={tab === "history"}                 onClick={() => setTab("history")}>Run History</PageTab>
          </>
        }
      />

      {(tab === "active" || tab === "drafts") && (
        <div className="flex-1 overflow-auto scrollbar-thin">
          <table className="w-full">
            <thead className="sticky top-0 bg-card border-b border-border z-10">
              <tr>
                {["Workflow", "Trigger", "Steps", "Runs (24h)", "Success", "Status"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-sm text-muted-foreground">
                    No workflows here yet
                  </td>
                </tr>
              ) : rows.map(wf => (
                <WFRow key={wf.id} wf={wf} onToggle={toggleStatus} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "templates" && (
        <EmptyState title="Templates" desc="Reusable workflow blueprints you can deploy with one click." />
      )}
      {tab === "history" && (
        <EmptyState title="Run History" desc="A full audit log of every workflow execution, step by step." />
      )}
    </>
  );
}
