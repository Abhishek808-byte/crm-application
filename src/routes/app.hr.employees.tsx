import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageTab } from "@/components/shell/PageHeader";
import { StatusPill } from "@/components/shell/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { EMPLOYEES } from "@/lib/erp-data";
import { Plus, Filter, Download, Search, Sparkles } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/hr/employees")({
  component: Employees,
});

const STATUS_TONE = {
  active: "success",
  leave: "warning",
  onboarding: "info",
} as const;

function Employees() {
  const [q, setQ] = useState("");
  const filtered = EMPLOYEES.filter(e =>
    !q || e.name.toLowerCase().includes(q.toLowerCase()) || e.id.includes(q.toUpperCase())
  );
  return (
    <>
      <PageHeader
        eyebrow="HRMS · People"
        title="Employees"
        description="14,200 operators across 23 countries"
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="size-3.5" /> Export</Button>
            <Button size="sm"><Plus className="size-3.5" /> Add employee</Button>
          </>
        }
        tabs={
          <>
            <PageTab active count={EMPLOYEES.length}>Directory</PageTab>
            <PageTab>Org chart</PageTab>
            <PageTab>Lifecycle</PageTab>
            <PageTab>Compliance</PageTab>
          </>
        }
      />

      <div className="px-4 py-3 flex items-center gap-2 border-b border-border bg-card">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search people, IDs, departments…"
            className="h-7 text-xs pl-8 w-72"
          />
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs"><Filter className="size-3.5" /> Department</Button>
        <Button variant="outline" size="sm" className="h-7 text-xs"><Filter className="size-3.5" /> Location</Button>
        <Button variant="outline" size="sm" className="h-7 text-xs"><Filter className="size-3.5" /> Status</Button>
        <div className="ml-auto inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-primary">
          <Sparkles className="size-3" /> AI: 3 retention risks detected
        </div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="sticky top-0 bg-card border-b border-border z-10">
            <tr className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2.5 w-8"><Checkbox /></th>
              {["Employee", "Title", "Department", "Location", "Manager", "Status", "Joined"].map(h => (
                <th key={h} className="px-3 py-2.5 font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(e => (
              <tr key={e.id} className="hover:bg-surface group">
                <td className="px-4 py-2"><Checkbox /></td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="size-7 rounded-full bg-surface-2 border border-border grid place-items-center text-[10px] font-mono font-semibold">
                      {e.initials}
                    </div>
                    <div>
                      <div className="text-xs font-medium">{e.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{e.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-xs">{e.title}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{e.department}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{e.location}</td>
                <td className="px-3 py-2 text-xs">{e.manager}</td>
                <td className="px-3 py-2"><StatusPill tone={STATUS_TONE[e.status]} dot>{e.status}</StatusPill></td>
                <td className="px-3 py-2 text-xs font-mono text-muted-foreground">{e.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
