import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageTab } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  TASKS, TASK_TYPE_META, CONTACTS,
  type Task, type TaskType, type TaskPriority,
} from "@/lib/erp-data";
import {
  Plus, List, LayoutGrid, CalendarRange, CheckCircle2, Circle,
  Trash2, Edit, Calendar, User, Zap,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/crm/tasks")({
  component: CRMTasks,
});

type View = "list" | "board" | "calendar";
type Tab  = "all" | "mine" | "overdue" | "completed";

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  high:   "text-destructive",
  medium: "text-warning",
  low:    "text-success",
};
const PRIORITY_BG: Record<TaskPriority, string> = {
  high:   "bg-destructive/10",
  medium: "bg-warning/10",
  low:    "bg-success/10",
};

const CUSTOM_TASK_TYPES = ["task", "call", "meeting", "email"] as TaskType[];

const BLANK_FORM = {
  title: "", type: "task" as TaskType, priority: "medium" as TaskPriority,
  contactId: "", dueDate: "", assignee: "D. Okonkwo", notes: "",
};

function CRMTasks() {
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [done, setDone] = useState<Set<string>>(
    () => new Set(TASKS.filter(t => t.status === "completed").map(t => t.id))
  );
  const [view, setView] = useState<View>("list");
  const [tab, setTab] = useState<Tab>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [newOpen, setNewOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [detail, setDetail] = useState<Task | null>(null);

  const now = new Date();

  const overdue = useMemo(
    () => tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && !done.has(t.id)),
    [tasks, done],
  );

  const visible = useMemo(() => {
    return tasks
      .filter(t => {
        if (tab === "mine")      return t.assignee === "D. Okonkwo";
        if (tab === "overdue")   return overdue.some(o => o.id === t.id);
        if (tab === "completed") return done.has(t.id);
        return true;
      })
      .filter(t => filterPriority === "all" || t.priority === filterPriority);
  }, [tasks, tab, overdue, done, filterPriority]);

  const counts = {
    all:       tasks.length,
    mine:      tasks.filter(t => t.assignee === "D. Okonkwo").length,
    overdue:   overdue.length,
    completed: done.size,
  };

  function toggleDone(id: string) {
    setDone(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function openNew() {
    setEditTask(null);
    setForm({ ...BLANK_FORM });
    setNewOpen(true);
  }

  function openEdit(t: Task) {
    setEditTask(t);
    setForm({
      title:     t.title,
      type:      t.type,
      priority:  t.priority,
      contactId: t.contactId || "",
      dueDate:   t.dueDate   || "",
      assignee:  t.assignee,
      notes:     t.notes     || "",
    });
    setDetail(null);
    setNewOpen(true);
  }

  function saveTask() {
    if (!form.title.trim()) return;
    const tm = TASK_TYPE_META[form.type];
    const contact = CONTACTS.find(c => c.id === form.contactId) || null;
    const base: Omit<Task, "id"> = {
      title:       form.title,
      type:        form.type,
      label:       tm.label,
      icon:        tm.icon,
      color:       tm.color,
      bgColor:     tm.bg,
      priority:    form.priority,
      status:      "open",
      contactId:   contact?.id,
      contactName: contact?.name,
      company:     contact?.company,
      dueDate:     form.dueDate || undefined,
      assignee:    form.assignee,
      notes:       form.notes   || undefined,
      isAuto:      false,
    };
    if (editTask) {
      setTasks(prev => prev.map(t => t.id === editTask.id ? { ...t, ...base } : t));
    } else {
      setTasks(prev => [{ id: `T-${String(prev.length + 1).padStart(3, "0")}`, ...base }, ...prev]);
    }
    setNewOpen(false);
  }

  function deleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id));
    setDetail(null);
  }

  return (
    <>
      <PageHeader
        eyebrow="CRM · Activity"
        title="Tasks"
        description={`${tasks.filter(t => !done.has(t.id)).length} open · ${done.size} completed`}
        actions={
          <>
            {/* View toggle */}
            <div className="flex rounded-md border border-border overflow-hidden">
              {(
                [
                  { key: "list" as View,     Icon: List,          label: "List"     },
                  { key: "board" as View,    Icon: LayoutGrid,    label: "Board"    },
                  { key: "calendar" as View, Icon: CalendarRange, label: "Calendar" },
                ] as { key: View; Icon: any; label: string }[]
              ).map(({ key, Icon, label }) => (
                <button
                  key={key}
                  title={label}
                  onClick={() => setView(key)}
                  className={`px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium border-r last:border-r-0 border-border transition-colors ${
                    view === key ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="h-8 text-xs w-36">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={openNew}>
              <Plus className="size-3.5" /> New Task
            </Button>
          </>
        }
        tabs={
          <>
            {(["all", "mine", "overdue", "completed"] as Tab[]).map(t => (
              <PageTab key={t} active={tab === t} count={counts[t]} onClick={() => setTab(t)}>
                {t === "all" ? "All" : t === "mine" ? "My Tasks" : t === "overdue" ? "Overdue" : "Completed"}
              </PageTab>
            ))}
          </>
        }
      />

      {/* Board view */}
      {view === "board" && (
        <div className="flex-1 overflow-auto scrollbar-thin p-6">
          <div className="flex gap-5 min-w-max items-start">
            {(["high", "medium", "low"] as TaskPriority[]).map(pri => {
              const priTasks = visible.filter(t => t.priority === pri);
              return (
                <div key={pri} className="w-72 shrink-0">
                  {/* Column header */}
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span className={cn("size-2 rounded-full", pri === "high" ? "bg-destructive" : pri === "medium" ? "bg-warning" : "bg-success")} />
                    <span className={cn("text-[11px] font-bold uppercase tracking-wider", PRIORITY_COLOR[pri])}>
                      {pri}
                    </span>
                    <span className="ml-auto text-[10px] font-semibold text-muted-foreground">{priTasks.length}</span>
                  </div>

                  {/* Cards */}
                  <div className="flex flex-col gap-2">
                    {priTasks.length === 0 && (
                      <div className="text-xs text-muted-foreground text-center py-8">No tasks</div>
                    )}
                    {priTasks.map(t => {
                      const isDone    = done.has(t.id);
                      const isOverdue = t.dueDate && new Date(t.dueDate) < now && !isDone;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setDetail(t)}
                          className={cn(
                            "bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-border/80 hover:shadow-sm transition-all",
                            isDone && "opacity-50"
                          )}
                        >
                          {/* Type dot + title */}
                          <div className="flex items-start gap-2">
                            <button
                              onClick={e => { e.stopPropagation(); toggleDone(t.id); }}
                              className="mt-0.5 shrink-0"
                            >
                              {isDone
                                ? <CheckCircle2 className="size-3.5 text-success" />
                                : <Circle       className="size-3.5 text-muted-foreground/40" />}
                            </button>
                            <span className={cn("text-xs font-medium flex-1 leading-snug", isDone && "line-through text-muted-foreground")}>
                              {t.title}
                            </span>
                          </div>

                          {/* Footer row */}
                          <div className="flex items-center gap-2 mt-2 ml-5">
                            <span className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                            <span className="text-[10px] text-muted-foreground flex-1 truncate">
                              {t.contactName || t.label}
                            </span>
                            {t.dueDate && (
                              <span className={cn(
                                "text-[10px] font-medium shrink-0",
                                isOverdue && !isDone ? "text-destructive" : "text-muted-foreground/60"
                              )}>
                                {t.dueDate}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Calendar view */}
      {view === "calendar" && (
        <div className="flex-1 overflow-auto scrollbar-thin p-6">
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            {(() => {
              const today = new Date();
              const year = today.getFullYear(), month = today.getMonth();
              const days = new Date(year, month + 1, 0).getDate();
              const firstDay = new Date(year, month, 1).getDay();
              const monthName = today.toLocaleString("default", { month: "long" });
              const tasksByDate: Record<string, Task[]> = {};
              visible.forEach(t => {
                if (t.dueDate) {
                  tasksByDate[t.dueDate] = tasksByDate[t.dueDate] || [];
                  tasksByDate[t.dueDate].push(t);
                }
              });
              const cells = Array.from({ length: firstDay + days }, (_, i) => i >= firstDay ? i - firstDay + 1 : null);
              return (
                <>
                  <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                    <span className="text-sm font-semibold">{monthName} {year}</span>
                    <span className="text-xs text-muted-foreground">
                      {Object.keys(tasksByDate).length} days with tasks
                    </span>
                  </div>
                  <div className="grid grid-cols-7 border-b border-border">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                      <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-r last:border-r-0 border-border bg-surface">
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {cells.map((day, i) => {
                      const dateStr = day
                        ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                        : null;
                      const dayTasks = dateStr ? (tasksByDate[dateStr] || []) : [];
                      const isToday = day === today.getDate();
                      return (
                        <div
                          key={i}
                          className={`min-h-[80px] p-1.5 border-r border-b last:border-r-0 border-border ${day ? "bg-card" : "bg-surface"}`}
                        >
                          {day && (
                            <div className={`text-xs font-medium mb-1 size-5 flex items-center justify-center rounded-full ${isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                              {day}
                            </div>
                          )}
                          {dayTasks.slice(0, 2).map(t => (
                            <div
                              key={t.id}
                              onClick={() => setDetail(t)}
                              className="text-[10px] font-medium text-white rounded px-1 py-0.5 mb-0.5 truncate cursor-pointer"
                              style={{ backgroundColor: t.color }}
                            >
                              {t.title}
                            </div>
                          ))}
                          {dayTasks.length > 2 && (
                            <div className="text-[10px] text-muted-foreground">+{dayTasks.length - 2} more</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div className="flex-1 overflow-auto scrollbar-thin">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <CheckCircle2 className="size-10 opacity-30" />
              <div className="text-sm">{tab === "completed" ? "No completed tasks yet" : "No tasks in this view"}</div>
              {tab === "all" && <Button size="sm" onClick={openNew}><Plus className="size-3.5" /> Create first task</Button>}
            </div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-card border-b border-border z-10">
                <tr>
                  <th className="px-4 py-2.5 w-8" />
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Task</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-24">Priority</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-32">Due Date</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-32">Assignee</th>
                  <th className="px-3 py-2.5 w-16" />
                </tr>
              </thead>
              <tbody>
                {visible.map(t => {
                  const isDone    = done.has(t.id);
                  const isOverdue = t.dueDate && new Date(t.dueDate) < now && !isDone;
                  return (
                    <tr
                      key={t.id}
                      onClick={() => setDetail(t)}
                      className={cn(
                        "border-b border-border cursor-pointer transition-colors hover:bg-surface group",
                        isDone && "opacity-50"
                      )}
                    >
                      {/* Done toggle */}
                      <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleDone(t.id); }}>
                        {isDone
                          ? <CheckCircle2 className="size-4 text-success" />
                          : <Circle       className="size-4 text-muted-foreground/40 hover:text-muted-foreground" />}
                      </td>

                      {/* Task title + type dot + contact */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          {/* Small type colour dot */}
                          <span
                            className="size-2 rounded-full shrink-0"
                            style={{ backgroundColor: t.color }}
                          />
                          <div className="min-w-0">
                            <div className={cn(
                              "text-xs font-medium truncate",
                              isDone && "line-through text-muted-foreground"
                            )}>
                              {t.title}
                            </div>
                            {t.contactName && (
                              <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                                {t.contactName} · {t.company}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Priority — plain text, no background box */}
                      <td className="px-3 py-3">
                        <span className={cn(
                          "text-[10px] font-semibold uppercase tracking-wide",
                          t.priority === "high"   ? "text-destructive"
                          : t.priority === "medium" ? "text-warning"
                          : "text-success"
                        )}>
                          {t.priority}
                        </span>
                      </td>

                      {/* Due date */}
                      <td className="px-3 py-3">
                        {t.dueDate ? (
                          <span className={cn(
                            "text-[11px]",
                            isOverdue && !isDone
                              ? "text-destructive font-semibold"
                              : "text-muted-foreground"
                          )}>
                            {t.dueDate}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/30">—</span>
                        )}
                      </td>

                      {/* Assignee */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-full bg-primary/10 text-primary grid place-items-center text-[9px] font-bold shrink-0">
                            {t.assignee.split(" ").map(p => p[0]).join("")}
                          </div>
                          <span className="text-[11px] text-muted-foreground truncate">{t.assignee}</span>
                        </div>
                      </td>

                      {/* Actions — visible on hover */}
                      <td className="px-3 py-3 text-right" onClick={e => e.stopPropagation()}>
                        {t.isAuto ? (
                          <span className="text-[9px] text-muted-foreground/50 flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100">
                            <Zap className="size-2.5" /> auto
                          </span>
                        ) : (
                          <div className="flex gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEdit(t)}
                              className="size-6 rounded grid place-items-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                              <Edit className="size-3" />
                            </button>
                            <button
                              onClick={() => deleteTask(t.id)}
                              className="size-6 rounded grid place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* New / Edit Task Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTask ? "Edit task" : "New task"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-1">
            <div className="grid gap-1.5">
              <Label className="text-xs">Title *</Label>
              <Input
                className="h-8 text-xs"
                placeholder="What needs to be done?"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Type</Label>
                <div className="flex flex-wrap gap-1.5">
                  {CUSTOM_TASK_TYPES.map(type => {
                    const tm = TASK_TYPE_META[type];
                    return (
                      <button
                        key={type}
                        onClick={() => setForm(f => ({ ...f, type }))}
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors"
                        style={form.type === type
                          ? { borderColor: tm.color, backgroundColor: tm.bg, color: tm.color }
                          : undefined}
                      >
                        {tm.icon} {tm.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Priority</Label>
                <div className="flex gap-1.5">
                  {(["high", "medium", "low"] as TaskPriority[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setForm(f => ({ ...f, priority: p }))}
                      className={`flex-1 text-[10px] font-bold py-1 rounded-full border capitalize transition-colors ${
                        form.priority === p ? `${PRIORITY_BG[p]} ${PRIORITY_COLOR[p]} border-current` : "border-border text-muted-foreground"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Link to contact</Label>
              <Select value={form.contactId} onValueChange={v => setForm(f => ({ ...f, contactId: v }))}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select contact…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {CONTACTS.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name} · {c.company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Due date</Label>
                <Input type="date" className="h-8 text-xs" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Assignee</Label>
                <Input className="h-8 text-xs" value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Notes</Label>
              <Textarea
                className="text-xs min-h-[60px] resize-none"
                placeholder="Add context or instructions…"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button size="sm" disabled={!form.title.trim()} onClick={saveTask}>
              {editTask ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task detail sheet */}
      <Sheet open={!!detail} onOpenChange={() => setDetail(null)}>
        <SheetContent className="w-96 flex flex-col">
          {detail && (() => {
            const isDone    = done.has(detail.id);
            const isOverdue = detail.dueDate && new Date(detail.dueDate) < now && !isDone;
            return (
              <div className="flex flex-col flex-1 min-h-0">
                {/* Type accent bar */}
                <div className="h-0.5 w-full mb-5" style={{ backgroundColor: detail.color }} />

                <SheetHeader className="mb-0">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleDone(detail.id)}
                      className="mt-0.5 shrink-0"
                    >
                      {isDone
                        ? <CheckCircle2 className="size-5 text-success" />
                        : <Circle       className="size-5 text-muted-foreground/40" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <SheetTitle className={cn("text-sm leading-snug", isDone && "line-through text-muted-foreground")}>
                        {detail.title}
                      </SheetTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: detail.color }} />
                        <span className="text-[11px] text-muted-foreground">{detail.label}</span>
                        <span className="mx-1 text-muted-foreground/30">·</span>
                        <span className={cn(
                          "text-[11px] font-semibold uppercase",
                          detail.priority === "high" ? "text-destructive" : detail.priority === "medium" ? "text-warning" : "text-success"
                        )}>
                          {detail.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </SheetHeader>

                {/* Flat meta rows */}
                <div className="mt-5 border-t border-border">
                  {[
                    detail.dueDate    && { Icon: Calendar, label: "Due date",  val: detail.dueDate, danger: !!(isOverdue && !isDone) },
                    detail.assignee   && { Icon: User,     label: "Assignee",  val: detail.assignee },
                    detail.isAuto     && { Icon: Zap,      label: "Source",    val: "Auto-detected" },
                  ].filter(Boolean).map((row, i) => {
                    if (!row) return null;
                    const { Icon, label, val, danger } = row as { Icon: any; label: string; val: string; danger?: boolean };
                    return (
                      <div key={i} className="flex items-center gap-3 py-3 border-b border-border">
                        <Icon className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="text-[11px] text-muted-foreground w-20 shrink-0">{label}</span>
                        <span className={cn("text-xs flex-1", danger ? "text-destructive font-semibold" : "")}>{val}</span>
                      </div>
                    );
                  })}

                  {detail.contactName && (
                    <div className="flex items-center gap-3 py-3 border-b border-border">
                      <User className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="text-[11px] text-muted-foreground w-20 shrink-0">Contact</span>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="size-5 rounded-full bg-primary/10 text-primary grid place-items-center text-[8px] font-bold shrink-0">
                          {detail.contactName.split(" ").map(p => p[0]).slice(0, 2).join("")}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate">{detail.contactName}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{detail.company}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {detail.notes && (
                  <div className="mt-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Notes</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{detail.notes}</p>
                  </div>
                )}

                {/* Footer actions */}
                <div className="flex gap-2 mt-auto pt-5 border-t border-border">
                  {!detail.isAuto && (
                    <>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(detail)}>
                        <Edit className="size-3.5" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive px-2.5" onClick={() => deleteTask(detail.id)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </>
                  )}
                  <Button size="sm" className="flex-1" onClick={() => setDetail(null)}>Close</Button>
                </div>
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>
    </>
  );
}
