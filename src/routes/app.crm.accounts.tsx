import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageTab } from "@/components/shell/PageHeader";
import { StatusPill } from "@/components/shell/StatusPill";
import { CRM_ACCOUNTS } from "@/lib/erp-data";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";

export const Route = createFileRoute("/app/crm/accounts")({
  component: CRMAccounts,
});

const HEALTH = { green: "success", amber: "warning", red: "danger" } as const;

function CRMAccounts() {
  return (
    <>
      <PageHeader
        eyebrow="CRM · Records"
        title="Accounts"
        description="Customer accounts and renewal health"
        actions={
          <>
            <Button variant="outline" size="sm"><Filter className="size-3.5" /> Segment</Button>
            <Button size="sm"><Plus className="size-3.5" /> New account</Button>
          </>
        }
        tabs={
          <>
            <PageTab active count={CRM_ACCOUNTS.length}>All</PageTab>
            <PageTab>Enterprise</PageTab>
            <PageTab>At risk</PageTab>
            <PageTab>Renewing 90d</PageTab>
          </>
        }
      />
      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-card border-b border-border z-10">
            <tr className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-left">
              {["Account", "Segment", "ARR", "Health", "Owner", "Renewal"].map(h => (
                <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {CRM_ACCOUNTS.map(a => (
              <tr key={a.id} className="hover:bg-surface">
                <td className="px-3 py-2">
                  <div className="text-xs font-semibold">{a.name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">{a.id}</div>
                </td>
                <td className="px-3 py-2 text-xs"><StatusPill tone="neutral">{a.segment}</StatusPill></td>
                <td className="px-3 py-2 text-xs font-mono tabular-nums font-semibold">${(a.arr / 1000).toFixed(0)}k</td>
                <td className="px-3 py-2"><StatusPill tone={HEALTH[a.health]} dot>{a.health}</StatusPill></td>
                <td className="px-3 py-2 text-xs">{a.owner}</td>
                <td className="px-3 py-2 text-xs font-mono text-muted-foreground">{a.renewal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
