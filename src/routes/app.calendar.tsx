import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageTab } from "@/components/shell/PageHeader";
import { StatusPill } from "@/components/shell/StatusPill";
import { Button } from "@/components/ui/button";
import { CALENDAR_EVENTS, TASKS, type EventType } from "@/lib/erp-data";
import {
  ChevronLeft, ChevronRight, Calendar, Clock, Users, Video,
  Phone, ClipboardList, AlertCircle, Plus,
} from "lucide-react";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/app/calendar")({
  component: CalendarPage,
});

const EVENT_TYPE_META: Record<EventType, { label: string; icon: any; color: string; bg: string; dot: string }> = {
  demo:     { label: "Demo",     icon: Video,        color: "text-violet-700", bg: "bg-violet-50",   dot: "bg-violet-500"  },
  meeting:  { label: "Meeting",  icon: Users,        color: "text-blue-700",   bg: "bg-blue-50",     dot: "bg-blue-500"    },
  call:     { label: "Call",     icon: Phone,        color: "text-green-700",  bg: "bg-green-50",    dot: "bg-green-500"   },
  review:   { label: "Review",   icon: ClipboardList,color: "text-amber-700",  bg: "bg-amber-50",    dot: "bg-amber-500"   },
  deadline: { label: "Deadline", icon: AlertCircle,  color: "text-red-700",    bg: "bg-red-50",      dot: "bg-red-500"     },
};

const TASK_DOT = "bg-primary";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function CalendarPage() {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view, setView]   = useState<"month" | "week" | "list">("month");
  const [filter, setFilter] = useState<EventType | "all" | "tasks">("all");

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  // Build a map of date-string → events+tasks
  const dateMap = useMemo(() => {
    const m = new Map<string, { events: typeof CALENDAR_EVENTS; tasks: typeof TASKS }>();

    CALENDAR_EVENTS.forEach(ev => {
      const d = ev.date.slice(0, 10);
      if (!m.has(d)) m.set(d, { events: [], tasks: [] });
      m.get(d)!.events.push(ev);
    });

    TASKS.forEach(t => {
      if (!t.dueDate) return;
      const d = t.dueDate.slice(0, 10);
      if (!m.has(d)) m.set(d, { events: [], tasks: [] });
      m.get(d)!.tasks.push(t);
    });

    return m;
  }, []);

  // Grid cells for the month view
  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) grid.push(null);
    for (let d = 1; d <= daysInMonth; d++) grid.push(d);
    while (grid.length % 7 !== 0) grid.push(null);
    return grid;
  }, [year, month]);

  // List view: all events+tasks sorted by date, optionally filtered
  const listItems = useMemo(() => {
    type ListItem = { date: string; kind: "event" | "task"; ev?: typeof CALENDAR_EVENTS[0]; task?: typeof TASKS[0] };
    const items: ListItem[] = [];

    CALENDAR_EVENTS.forEach(ev => {
      if (filter === "tasks") return;
      if (filter !== "all" && ev.type !== filter) return;
      items.push({ date: ev.date.slice(0, 10), kind: "event", ev });
    });

    TASKS.forEach(t => {
      if (!t.dueDate) return;
      if (filter !== "all" && filter !== "tasks") return;
      items.push({ date: t.dueDate.slice(0, 10), kind: "task", task: t });
    });

    return items.sort((a, b) => a.date.localeCompare(b.date));
  }, [filter]);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <>
      <PageHeader
        eyebrow="CRM · Schedule"
        title="Calendar"
        description="Demos, meetings, tasks and deadlines"
        actions={<Button size="sm"><Plus className="size-3.5" /> Add event</Button>}
        tabs={
          <>
            <PageTab active={view === "month"} onClick={() => setView("month")}>Month</PageTab>
            <PageTab active={view === "week"}  onClick={() => setView("week")}>Week</PageTab>
            <PageTab active={view === "list"}  onClick={() => setView("list")}>List</PageTab>
          </>
        }
      />

      {/* Toolbar row */}
      <div className="px-6 py-2.5 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="size-7" onClick={prevMonth}><ChevronLeft className="size-4" /></Button>
          <span className="text-sm font-semibold tabular-nums min-w-[140px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <Button variant="ghost" size="icon" className="size-7" onClick={nextMonth}><ChevronRight className="size-4" /></Button>
          <Button
            variant="outline" size="sm" className="h-7 text-[11px]"
            onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }}
          >
            Today
          </Button>
        </div>

        {/* Type filter pills */}
        <div className="flex gap-1.5">
          {([
            { key: "all",      label: "All" },
            { key: "demo",     label: "Demos"    },
            { key: "meeting",  label: "Meetings" },
            { key: "call",     label: "Calls"    },
            { key: "tasks",    label: "Tasks"    },
          ] as const).map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                filter === f.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {view === "month" && (
        <div className="flex-1 overflow-auto scrollbar-thin p-4">
          {/* Day-name header */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center py-1">{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border border-border">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} className="bg-surface min-h-[90px]" />;

              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const cell    = dateMap.get(dateStr);
              const isToday = dateStr === todayStr;

              const visibleEvents = (cell?.events || []).filter(ev => filter === "all" || filter === ev.type);
              const visibleTasks  = (cell?.tasks  || []).filter(() => filter === "all" || filter === "tasks");
              const extraEvents   = visibleEvents.length + visibleTasks.length > 3;

              return (
                <div key={i} className={`bg-card min-h-[90px] p-1.5 ${isToday ? "ring-1 ring-primary/50 ring-inset" : ""}`}>
                  <div className={`text-[10px] font-bold w-5 h-5 grid place-items-center rounded-full mb-1 ${
                    isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                  }`}>{day}</div>

                  <div className="flex flex-col gap-0.5">
                    {visibleEvents.slice(0, 2).map(ev => {
                      const meta = EVENT_TYPE_META[ev.type];
                      return (
                        <div key={ev.id} className={`flex items-center gap-1 rounded px-1 py-0.5 cursor-pointer hover:opacity-80 ${meta.bg}`}>
                          <div className={`size-1.5 rounded-full shrink-0 ${meta.dot}`} />
                          <span className={`text-[9px] font-semibold truncate ${meta.color}`}>{ev.title}</span>
                        </div>
                      );
                    })}
                    {visibleTasks.slice(0, Math.max(0, 2 - visibleEvents.length)).map(t => (
                      <div key={t.id} className="flex items-center gap-1 rounded px-1 py-0.5 bg-primary/8 cursor-pointer hover:opacity-80">
                        <div className={`size-1.5 rounded-full shrink-0 ${TASK_DOT}`} />
                        <span className="text-[9px] font-semibold truncate text-primary">{t.title}</span>
                      </div>
                    ))}
                    {extraEvents && (
                      <span className="text-[9px] text-muted-foreground pl-1">
                        +{(visibleEvents.length + visibleTasks.length) - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "week" && (
        <div className="flex-1 overflow-auto scrollbar-thin p-4 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Week view — switch to Month or List to see full schedule</div>
        </div>
      )}

      {view === "list" && (
        <div className="flex-1 overflow-auto scrollbar-thin p-6">
          {listItems.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-16">No events found</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(
                listItems.reduce((acc, item) => {
                  if (!acc[item.date]) acc[item.date] = [];
                  acc[item.date].push(item);
                  return acc;
                }, {} as Record<string, typeof listItems>)
              ).map(([date, items]) => {
                const d = new Date(date + "T00:00:00");
                const isToday = date === todayStr;
                return (
                  <div key={date}>
                    <div className={`flex items-center gap-2 mb-2 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                      <div className={`text-xs font-bold ${isToday ? "bg-primary text-primary-foreground px-2 py-0.5 rounded-full" : ""}`}>
                        {d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                      </div>
                      {isToday && <span className="text-[10px] font-semibold">Today</span>}
                    </div>
                    <div className="rounded-lg border border-border bg-card overflow-hidden divide-y divide-border">
                      {items.map((item, idx) => {
                        if (item.kind === "event" && item.ev) {
                          const ev   = item.ev;
                          const meta = EVENT_TYPE_META[ev.type];
                          const Icon = meta.icon;
                          return (
                            <div key={`ev-${ev.id}`} className="px-3 py-2.5 hover:bg-surface flex items-center gap-3">
                              <div className={`size-7 rounded-md grid place-items-center shrink-0 ${meta.bg}`}>
                                <Icon className={`size-3.5 ${meta.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold">{ev.title}</div>
                                {(ev.contact || ev.company) && (
                                  <div className="text-[10px] text-muted-foreground">
                                    {[ev.contact, ev.company].filter(Boolean).join(" · ")}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Clock className="size-3" /> {ev.time}
                                </div>
                                {ev.duration && (
                                  <span className="text-[10px] text-muted-foreground">{ev.duration}</span>
                                )}
                                <StatusPill tone={ev.type === "demo" ? "info" : ev.type === "deadline" ? "danger" : "neutral"}>
                                  {meta.label}
                                </StatusPill>
                              </div>
                            </div>
                          );
                        }
                        if (item.kind === "task" && item.task) {
                          const t = item.task;
                          const isOverdue = date < todayStr && t.status === "open";
                          return (
                            <div key={`task-${t.id}`} className="px-3 py-2.5 hover:bg-surface flex items-center gap-3">
                              <div className="size-7 rounded-md bg-primary/10 text-primary grid place-items-center shrink-0">
                                <ClipboardList className="size-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold">{t.title}</div>
                                {t.contactName && (
                                  <div className="text-[10px] text-muted-foreground">{t.contactName}</div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <StatusPill
                                  tone={isOverdue ? "danger" : t.priority === "high" ? "danger" : t.priority === "medium" ? "warning" : "neutral"}
                                >
                                  {isOverdue ? "Overdue" : t.priority}
                                </StatusPill>
                                <StatusPill tone={t.status === "completed" ? "success" : "neutral"}>
                                  {t.status}
                                </StatusPill>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
