import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageTab } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Workflow as WfIcon, Play, Pause, AlertTriangle } from "lucide-react";
import { StatusPill } from "@/components/shell/StatusPill";

export const Route = createFileRoute("/app/workflows")({
  component: Workflows,
});

const FLOWS = [
  { id: "WF-2241", name: "Quarterly Audit", trigger: "Schedule · Q-end", steps: 14, runs: 4, status: "running", success: 99.2 },
  { id: "WF-2188", name: "Tax Filing 2026", trigger: "Manual · Finance", steps: 22, runs: 1, status: "running", success: 100 },
  { id: "WF-1102", name: "Q3 Hiring Plan", trigger: "Event · Job opened", steps: 8, runs: 24, status: "running", success: 96.5 },
  { id: "WF-3019", name: "Vendor Re-cert 2026", trigger: "Schedule · Monthly", steps: 11, runs: 12, status: "paused", success: 92.1 },
  { id: "WF-4407", name: "Helpdesk SLA Escalation", trigger: "Event · Ticket aging", steps: 5, runs: 312, status: "running", success: 97.8 },
  { id: "WF-5180", name: "Expense → Reimbursement", trigger: "Event · Expense submitted", steps: 9, runs: 1280, status: "running", success: 98.4 },
];

function Workflows() {
  return (
    <>
      <PageHeader
        eyebrow="Platform"
        title="Workflow Automation"
        description="Designer, runtime, and orchestration health"
        actions={<Button size="sm"><Plus className="size-3.5" /> New workflow</Button>}
        tabs={<><PageTab active count={FLOWS.length}>Active</PageTab><PageTab>Drafts</PageTab><PageTab>Templates</PageTab><PageTab>Run history</PageTab></>}
      />
      <div className="flex-1 overflow-auto scrollbar-thin p-6">
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface border-b border-border">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {["Workflow", "Trigger", "Steps", "Runs (24h)", "Success", "Status", ""].map(h => (
                  <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {FLOWS.map(f => (
                <tr key={f.id} className="hover:bg-surface">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-md bg-primary/10 text-primary grid place-items-center">
                        <WfIcon className="size-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{f.name}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">{f.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{f.trigger}</td>
                  <td className="px-4 py-3 text-xs font-mono">{f.steps}</td>
                  <td className="px-4 py-3 text-xs font-mono">{f.runs.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs font-mono tabular-nums">{f.success}%</td>
                  <td className="px-4 py-3">
                    <StatusPill tone={f.status === "running" ? "success" : "warning"} dot>{f.status}</StatusPill>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {f.status === "running" ? (
                      <Button variant="ghost" size="sm" className="h-7"><Pause className="size-3.5" /></Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-7"><Play className="size-3.5" /></Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-lg border border-warning/25 bg-warning/5 p-4 flex items-start gap-3">
          <AlertTriangle className="size-4 text-warning mt-0.5" />
          <div className="text-xs">
            <div className="font-semibold">2 workflows degraded</div>
            <div className="text-muted-foreground mt-0.5">WF-3019 paused — vendor API rate-limited. WF-1102 retrying 1/3.</div>
          </div>
        </div>
      </div>
    </>
  );
}
