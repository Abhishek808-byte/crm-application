import {
  BarChart3, Sparkles, LayoutGrid,
  Briefcase, Megaphone, CalendarDays,
  Contact, Building2, Target, ListChecks, GitMerge,
  FileText, Gauge,
} from "lucide-react";

export type ModuleId =
  | "crm" | "marketing" | "calendar" | "analytics" | "ai";

export interface SubmoduleDef {
  label: string;
  path: string;
  icon: typeof Briefcase;
  description?: string;
  badge?: string;
}

export interface ModuleDef {
  id: ModuleId;
  name: string;
  description: string;
  category: "Revenue" | "Platform";
  icon: typeof Briefcase;
  color: string;
  defaultPath: string;
  submodules: SubmoduleDef[];
}

export const MODULES: ModuleDef[] = [
  {
    id: "crm", name: "CRM", description: "Contacts, deals, pipeline",
    category: "Revenue", icon: Briefcase,
    color: "text-violet-600 bg-violet-50 dark:bg-violet-950/40",
    defaultPath: "/app/crm/contacts",
    submodules: [
      { label: "Contacts",  path: "/app/crm/contacts",  icon: Contact,      description: "Contacts, leads & deals"    },
      { label: "Accounts",  path: "/app/crm/accounts",  icon: Building2,    description: "Company accounts & health"  },
      { label: "Automation", path: "/app/crm/pipeline",  icon: GitMerge,     description: "AI-powered sales workflows"  },
      { label: "Deals",     path: "/app/crm/deals",     icon: Target,       description: "Pipeline & forecast"        },
      { label: "Tasks",     path: "/app/crm/tasks",     icon: ListChecks,   description: "Tasks, calls & meetings", badge: "8" },
      { label: "Calendar",  path: "/app/calendar",      icon: CalendarDays, description: "Demos, calls & deadlines"   },
      { label: "Marketing", path: "/app/marketing",     icon: Megaphone,    description: "Campaigns, content & ICP"   },
    ],
  },
  {
    id: "marketing", name: "Marketing", description: "Campaigns, content, ICP",
    category: "Revenue", icon: Megaphone,
    color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40",
    defaultPath: "/app/marketing",
    submodules: [
      { label: "Campaigns & Content", path: "/app/marketing", icon: Megaphone,    description: "Campaigns, content hub & ICP" },
      { label: "Calendar",            path: "/app/calendar",  icon: CalendarDays, description: "Publishing schedule"           },
    ],
  },
  {
    id: "calendar", name: "Calendar", description: "Demos, meetings & deadlines",
    category: "Revenue", icon: CalendarDays,
    color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40",
    defaultPath: "/app/calendar",
    submodules: [
      { label: "Calendar", path: "/app/calendar", icon: CalendarDays, description: "Monthly schedule view" },
    ],
  },
  {
    id: "analytics", name: "Analytics", description: "CRM dashboards & reports",
    category: "Platform", icon: BarChart3,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
    defaultPath: "/app/analytics",
    submodules: [
      { label: "CRM Analytics", path: "/app/analytics", icon: Gauge, description: "Pipeline, qual rate, sources & reviewers" },
    ],
  },
  {
    id: "ai", name: "AI Assistant", description: "CRM-aware copilot",
    category: "Platform", icon: Sparkles,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40",
    defaultPath: "/app/ai",
    submodules: [
      { label: "Assistant", path: "/app/ai", icon: Sparkles, description: "Conversational copilot" },
    ],
  },
];

export interface NavItem {
  label: string;
  path: string;
  icon: typeof Briefcase;
  badge?: string;
}

export interface WorkspaceConfig {
  id: ModuleId;
  name: string;
  sections: { title: string; items: NavItem[] }[];
  pinned: { label: string; path: string; ref: string; progress: number }[];
}

function buildWorkspace(
  id: ModuleId,
  name: string,
  sections: { title: string; itemPaths: string[] }[],
  pinned: WorkspaceConfig["pinned"] = []
): WorkspaceConfig {
  const mod = MODULES.find((m) => m.id === id)!;
  const byPath = new Map(mod.submodules.map((s) => [s.path, s]));
  return {
    id,
    name,
    sections: sections.map((s) => ({
      title: s.title,
      items: s.itemPaths
        .map((p) => byPath.get(p))
        .filter((x): x is SubmoduleDef => !!x)
        .map((x) => ({ label: x.label, path: x.path, icon: x.icon, badge: x.badge })),
    })),
    pinned,
  };
}

export const WORKSPACES: Record<string, WorkspaceConfig> = {
  crm: buildWorkspace("crm", "CRM", [
    { title: "Records",   itemPaths: ["/app/crm/contacts", "/app/crm/accounts", "/app/crm/deals"] },
    { title: "Activity",  itemPaths: ["/app/crm/pipeline", "/app/crm/tasks", "/app/calendar"]    },
    { title: "Marketing", itemPaths: ["/app/marketing"]                                           },
  ], [
    { label: "Q3 Enterprise Push",  path: "/app/crm/pipeline", ref: "PIPE-Q3",  progress: 42 },
    { label: "Healthcare Vertical", path: "/app/crm/deals",    ref: "DEAL-HCX", progress: 68 },
  ]),
  marketing: buildWorkspace("marketing", "Marketing", [
    { title: "Campaigns", itemPaths: ["/app/marketing", "/app/calendar"] },
  ], [
    { label: "Q3 LinkedIn Push", path: "/app/marketing", ref: "MKT-Q3", progress: 55 },
  ]),
  analytics: buildWorkspace("analytics", "Analytics", [
    { title: "Insights", itemPaths: ["/app/analytics"] },
  ]),
  ai: buildWorkspace("ai", "AI Assistant", [
    { title: "Tools", itemPaths: ["/app/ai"] },
  ]),
};

export const APP_LAUNCHER_ICON = LayoutGrid;
