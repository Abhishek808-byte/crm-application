import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRight, Lock, ShieldCheck, Users, Briefcase } from "lucide-react";
import { WORKSPACES, type ModuleId } from "@/lib/erp-config";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { useShell } from "@/lib/shell-store";

// ── Role system ───────────────────────────────────────────────────────────────
export type UserRole = "admin" | "manager" | "rep";

const ROLE_LEVEL: Record<UserRole, number> = { admin: 3, manager: 2, rep: 1 };

const ROLE_GATES: Record<string, UserRole> = {
  "/app/analytics":    "manager",
  "/app/crm/pipeline": "manager",
  "/app/crm/deals":    "manager",
  "/app/marketing":    "manager",
};

const ROLE_META: Record<UserRole, { label: string; colorCls: string; bgCls: string; icon: any }> = {
  admin:   { label: "Admin",   colorCls: "text-violet-600",  bgCls: "bg-violet-50",   icon: ShieldCheck },
  manager: { label: "Manager", colorCls: "text-blue-600",    bgCls: "bg-blue-50",     icon: Briefcase   },
  rep:     { label: "Rep",     colorCls: "text-emerald-600", bgCls: "bg-emerald-50",  icon: Users       },
};

function canAccess(path: string, role: UserRole): boolean {
  const required = ROLE_GATES[path];
  if (!required) return true;
  return ROLE_LEVEL[role] >= ROLE_LEVEL[required];
}

function detectWorkspace(pathname: string): ModuleId {
  const seg = pathname.split("/")[2] as ModuleId;
  if (seg && seg in WORKSPACES) return seg;
  return "crm";
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Sidebar() {
  const location = useLocation();
  const ws       = useMemo(() => WORKSPACES[detectWorkspace(location.pathname)], [location.pathname]);
  const [role, setRole]         = useState<UserRole>("admin");
  const [roleOpen, setRoleOpen] = useState(false);
  const collapsed               = useShell(s => s.sidebarCollapsed);

  const rm    = ROLE_META[role];
  const RIcon = rm.icon;

  return (
    <aside className={cn(
      "shrink-0 border-r border-sidebar-border bg-sidebar flex flex-col overflow-hidden transition-all duration-200",
      collapsed ? "w-14" : "w-56"
    )}>
      {/* Workspace label */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {ws.name}
          </div>
        </div>
      )}

      {/* Nav sections */}
      <nav className={cn(
        "flex-1 overflow-y-auto scrollbar-thin pb-4",
        collapsed ? "px-1.5 pt-3 space-y-1" : "px-2 pt-0 space-y-5"
      )}>
        {ws.sections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <div className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {section.title}
              </div>
            )}
            <div className={collapsed ? "space-y-1" : "space-y-0.5"}>
              {section.items.map((item) => {
                const Icon    = item.icon;
                const active  = location.pathname === item.path;
                const allowed = canAccess(item.path, role);
                const req     = ROLE_GATES[item.path];

                if (allowed) {
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group flex items-center rounded-md font-medium transition-colors",
                        collapsed
                          ? "h-9 w-9 mx-auto justify-center"
                          : "gap-2 h-8 px-2 text-[13px]",
                        active
                          ? "bg-primary/8 text-primary border border-primary/15"
                          : "text-foreground/80 hover:bg-sidebar-accent hover:text-foreground border border-transparent"
                      )}
                    >
                      <Icon className={cn(
                        "shrink-0",
                        collapsed ? "size-4" : "size-3.5",
                        active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <span className={cn(
                              "text-[10px] font-mono px-1.5 rounded",
                              active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                }

                // Locked item
                return (
                  <div
                    key={item.path}
                    title={collapsed ? `${item.label} (requires ${req})` : `Requires ${req} role`}
                    className={cn(
                      "flex items-center rounded-md font-medium text-muted-foreground/40 border border-transparent select-none cursor-not-allowed",
                      collapsed ? "h-9 w-9 mx-auto justify-center" : "gap-2 h-8 px-2 text-[13px]"
                    )}
                  >
                    <Icon className={cn("shrink-0 text-muted-foreground/30", collapsed ? "size-4" : "size-3.5")} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        <Lock className="size-3 text-muted-foreground/30 shrink-0" />
                        {req && (
                          <span className={cn(
                            "text-[8px] font-bold px-1 py-0.5 rounded uppercase tracking-wider",
                            ROLE_META[req].colorCls, ROLE_META[req].bgCls
                          )}>
                            {req}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Bottom: role switcher + user ─────────────────────────────────── */}
      <div className="border-t border-sidebar-border p-2 space-y-1">
        {collapsed ? (
          /* Icon-only bottom */
          <>
            <div
              title={`Role: ${rm.label}`}
              className={cn("size-9 mx-auto rounded grid place-items-center cursor-pointer hover:opacity-80", rm.bgCls)}
            >
              <RIcon className={cn("size-4", rm.colorCls)} />
            </div>
            <Link to="/app/profile" title="Alex Sterling · Sales Manager"
              className="size-9 mx-auto rounded-full bg-surface-2 border border-border grid place-items-center text-[10px] font-mono font-semibold hover:bg-muted transition-colors">
              AS
            </Link>
          </>
        ) : (
          <>
            {/* Role switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleOpen(v => !v)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
              >
                <div className={cn("size-5 rounded grid place-items-center shrink-0", rm.bgCls)}>
                  <RIcon className={cn("size-3", rm.colorCls)} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Viewing as</div>
                  <div className={cn("text-[11px] font-bold", rm.colorCls)}>{rm.label}</div>
                </div>
                <ChevronRight className={cn(
                  "size-3 text-muted-foreground transition-transform duration-150",
                  roleOpen && "rotate-90"
                )} />
              </button>

              {roleOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border border-border bg-card shadow-lg overflow-hidden z-30">
                  <div className="px-3 py-1.5 border-b border-border">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Switch access level
                    </span>
                  </div>
                  {(["admin", "manager", "rep"] as UserRole[]).map(r => {
                    const m     = ROLE_META[r];
                    const MIcon = m.icon;
                    return (
                      <button
                        key={r}
                        onClick={() => { setRole(r); setRoleOpen(false); }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-surface text-left transition-colors",
                          role === r && "bg-primary/5"
                        )}
                      >
                        <div className={cn("size-6 rounded grid place-items-center shrink-0", m.bgCls)}>
                          <MIcon className={cn("size-3.5", m.colorCls)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold">{m.label}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {r === "admin" ? "Full access to all modules"
                             : r === "manager" ? "Pipeline, deals & analytics"
                             : "Contacts, tasks & calendar"}
                          </div>
                        </div>
                        {role === r && <div className="size-1.5 rounded-full bg-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* User */}
            <Link to="/app/profile" className="flex items-center gap-2.5 group px-1">
              <div className="size-7 rounded-full bg-surface-2 border border-border grid place-items-center text-[10px] font-mono font-semibold">
                AS
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold truncate">Alex Sterling</div>
                <div className="text-[10px] text-muted-foreground truncate">Sales Manager</div>
              </div>
              <ChevronRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
