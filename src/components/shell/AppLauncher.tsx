import { useNavigate } from "@tanstack/react-router";
import { useShell } from "@/lib/shell-store";
import { MODULES, type ModuleDef, type SubmoduleDef } from "@/lib/erp-config";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, CornerDownLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Revenue", "Platform"] as const;

export function AppLauncher() {
  const { appLauncherOpen, setAppLauncher } = useShell();
  const [q, setQ] = useState("");
  const [hovered, setHovered] = useState<ModuleDef | null>(null);
  const navigate = useNavigate();

  const filtered = useMemo(
    () => MODULES.filter((m) => {
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return (
        m.name.toLowerCase().includes(needle) ||
        m.description.toLowerCase().includes(needle) ||
        m.submodules.some((s) => s.label.toLowerCase().includes(needle))
      );
    }),
    [q]
  );

  const grouped = useMemo(() => {
    const map: Record<string, ModuleDef[]> = {};
    for (const c of CATEGORIES) map[c] = [];
    for (const m of filtered) map[m.category].push(m);
    return map;
  }, [filtered]);

  // Sub-module hits when searching (cross-module)
  const subHits = useMemo(() => {
    if (!q.trim()) return [];
    const needle = q.toLowerCase();
    const hits: { module: ModuleDef; sub: SubmoduleDef }[] = [];
    for (const m of MODULES) {
      for (const s of m.submodules) {
        if (s.label.toLowerCase().includes(needle)) hits.push({ module: m, sub: s });
      }
    }
    return hits.slice(0, 6);
  }, [q]);

  const active = hovered ?? filtered[0] ?? MODULES[0];

  function goModule(m: ModuleDef) {
    setAppLauncher(false);
    setQ("");
    setHovered(null);
    navigate({ to: m.defaultPath });
  }
  function goSub(path: string) {
    setAppLauncher(false);
    setQ("");
    setHovered(null);
    navigate({ to: path });
  }

  return (
    <Dialog open={appLauncherOpen} onOpenChange={setAppLauncher}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden gap-0">
        <DialogHeader className="px-5 pt-4 pb-3 border-b border-border">
          <DialogTitle className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            CRM app launcher
          </DialogTitle>
        </DialogHeader>
        <div className="relative px-5 py-3 border-b border-border">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Find a module or sub-module…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 h-10 text-sm border-none bg-surface focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <div className="grid grid-cols-[1fr_320px] max-h-[60vh]">
          {/* LEFT: modules grid */}
          <div className="overflow-y-auto p-5 space-y-5 border-r border-border">
            {CATEGORIES.map((cat) => grouped[cat].length > 0 && (
              <section key={cat}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  {cat}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {grouped[cat].map((m) => {
                    const Icon = m.icon;
                    const isActive = active?.id === m.id;
                    return (
                      <button
                        key={m.id}
                        onMouseEnter={() => setHovered(m)}
                        onFocus={() => setHovered(m)}
                        onClick={() => goModule(m)}
                        className={cn(
                          "group flex items-start gap-3 p-3 rounded-lg border text-left transition-colors",
                          isActive
                            ? "border-primary/40 bg-surface"
                            : "border-border bg-card hover:border-primary/30 hover:bg-surface"
                        )}
                      >
                        <div className={cn("size-9 rounded-md grid place-items-center shrink-0", m.color)}>
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold truncate">{m.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                              {m.submodules.length}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">{m.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}

            {subHits.length > 0 && (
              <section>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Sub-module matches
                </div>
                <div className="space-y-1">
                  {subHits.map(({ module, sub }) => {
                    const SIcon = sub.icon;
                    return (
                      <button
                        key={sub.path}
                        onClick={() => goSub(sub.path)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md border border-border bg-card hover:border-primary/30 hover:bg-surface text-left"
                      >
                        <SIcon className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="text-[11px] font-mono text-muted-foreground">{module.name}</span>
                        <ChevronRight className="size-3 text-muted-foreground shrink-0" />
                        <span className="text-[13px] font-medium truncate">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {filtered.length === 0 && subHits.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-12">
                No modules match "{q}"
              </div>
            )}
          </div>

          {/* RIGHT: sub-module peek panel */}
          <aside className="overflow-y-auto bg-surface/60">
            {active && (
              <div className="p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className={cn("size-8 rounded-md grid place-items-center shrink-0", active.color)}>
                    <active.icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{active.name}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {active.submodules.length} sub-modules
                    </div>
                  </div>
                </div>

                <div className="space-y-0.5">
                  {active.submodules.map((s) => {
                    const SIcon = s.icon;
                    return (
                      <button
                        key={s.path}
                        onClick={() => goSub(s.path)}
                        className="w-full group flex items-start gap-2.5 px-2.5 py-2 rounded-md hover:bg-card border border-transparent hover:border-border text-left"
                      >
                        <SIcon className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12.5px] font-medium truncate">{s.label}</span>
                            {s.badge && (
                              <span className="text-[10px] font-mono px-1.5 rounded bg-muted text-muted-foreground">
                                {s.badge}
                              </span>
                            )}
                          </div>
                          {s.description && (
                            <div className="text-[10.5px] text-muted-foreground truncate">{s.description}</div>
                          )}
                        </div>
                        <ChevronRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-60 mt-1" />
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => goModule(active)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 h-8 rounded-md border border-border bg-card hover:border-primary/40 text-[11px] font-semibold"
                >
                  Open {active.name} <CornerDownLeft className="size-3" />
                </button>
              </div>
            )}
          </aside>
        </div>

        <div className="border-t border-border px-5 py-2.5 flex items-center justify-between text-[10px] text-muted-foreground bg-surface">
          <span>{MODULES.length} modules · hover to peek sub-modules</span>
          <span className="font-mono">⌘J</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
