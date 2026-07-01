import { createFileRoute } from "@tanstack/react-router";
import { StatusPill } from "@/components/shell/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  CONTACTS, STAGE_META, TASKS,
  type Contact, type ContactStage,
} from "@/lib/erp-data";
import {
  Plus, Search, Mail, Phone, Globe, MapPin, Users, Banknote,
  CheckCircle2, Circle, MoreHorizontal, Pencil, Trash2, Target,
  ClipboardList, Calendar, BarChart3, Building2, Tag,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { LeadflowPanel } from "@/components/crm/LeadflowPanel";

export const Route = createFileRoute("/app/crm/contacts")({
  component: CRMContacts,
});

// Pipeline stage order for the stepper (excluding disqualified which is an exit)
const STAGE_ORDER: ContactStage[] = [
  "crm", "icp", "qualification", "email_review", "response", "demo", "won",
];

const STAGE_LABELS: Record<string, string> = {
  crm:           "Lead Added",
  icp:           "ICP Scored",
  qualification: "Qualified",
  email_review:  "Outreach",
  response:      "Response",
  demo:          "Demo",
  won:           "Won",
};

const FILTER_GROUPS = [
  { key: "all",     label: "All"      },
  { key: "contact", label: "Contacts" },
  { key: "lead",    label: "Leads"    },
  { key: "deal",    label: "Deals"    },
  { key: "won",     label: "Won"      },
  { key: "lost",    label: "Lost"     },
] as const;

const BLANK_FORM = {
  name: "", title: "", company: "", domain: "", email: "",
  phone: "", location: "", industry: "", source: "", stage: "crm" as ContactStage,
};

// ── Contact Detail ─────────────────────────────────────────────────────────────

function PipelineStepper({ stage }: { stage: ContactStage }) {
  const isDisqualified = stage === "disqualified";
  const currentIdx = STAGE_ORDER.indexOf(stage);

  return (
    <div>
      {isDisqualified && (
        <div className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-destructive/10 text-destructive">
          Disqualified — removed from active pipeline
        </div>
      )}
      <div className="flex items-start w-full overflow-x-auto pb-1">
        {STAGE_ORDER.map((s, i) => {
          const isDone    = !isDisqualified && i < currentIdx;
          const isCurrent = !isDisqualified && i === currentIdx;
          const isPending = isDisqualified || i > currentIdx;

          return (
            <div key={s} className="flex items-start flex-1 min-w-[56px]">
              <div className="flex flex-col items-center flex-1">
                <div className={cn(
                  "size-8 rounded-full grid place-items-center text-[11px] font-bold border-2 shrink-0",
                  isDone    ? "bg-success border-success text-white"
                  : isCurrent ? "bg-primary border-primary text-primary-foreground"
                  : "bg-card border-border text-muted-foreground"
                )}>
                  {isDone ? <CheckCircle2 className="size-4" /> : <span>{i + 1}</span>}
                </div>
                <div className={cn(
                  "text-[9px] mt-1 text-center leading-tight font-medium px-0.5",
                  isDone ? "text-success" : isCurrent ? "text-primary font-semibold" : "text-muted-foreground/60"
                )}>
                  {STAGE_LABELS[s]}
                </div>
              </div>
              {i < STAGE_ORDER.length - 1 && (
                <div className={cn(
                  "h-0.5 flex-1 mt-4 shrink-0",
                  isDone ? "bg-success" : "bg-border"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AboutRow({ label, value, icon: Icon }: { label: string; value?: string | number; icon?: any }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-2">
      {Icon && <Icon className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />}
      <div>
        <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-xs font-medium mt-0.5">{String(value)}</div>
      </div>
    </div>
  );
}

function ContactDetail({
  contact,
  onStageChange,
  onDelete,
}: {
  contact: Contact;
  onStageChange: (id: string, stage: ContactStage) => void;
  onDelete: (id: string) => void;
}) {
  const sm = STAGE_META[contact.stage];
  const linkedTasks = TASKS.filter(t => t.contactId === contact.id);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── Contact header ──────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="size-12 rounded-full bg-primary/10 text-primary grid place-items-center text-base font-bold shrink-0 border border-primary/20">
              {contact.initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-semibold">{contact.name}</h2>
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", sm.color, sm.bg)}>
                  {sm.label}
                </span>
                {contact.stage === "disqualified" && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                    Lost
                  </span>
                )}
                {contact.stage === "won" && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success">
                    Won
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {[contact.title, contact.company].filter(Boolean).join(" · ")}
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary">
                    <Mail className="size-3" /> {contact.email}
                  </a>
                )}
                {contact.domain && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Globe className="size-3" /> {contact.domain}
                  </span>
                )}
                {contact.phone && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Phone className="size-3" /> {contact.phone}
                  </span>
                )}
                {contact.location && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="size-3" /> {contact.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {contact.icpScore > 0 && (
              <div className="hidden lg:flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-md border border-border bg-card">
                <BarChart3 className="size-3 text-primary" />
                ICP {contact.icpScore}
              </div>
            )}
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <Mail className="size-3" /> Email
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <Phone className="size-3" /> Call
            </Button>
            <Button size="sm" className="h-7 text-xs gap-1">
              <Plus className="size-3" /> Task
            </Button>
            <button
              onClick={() => onDelete(contact.id)}
              className="size-7 grid place-items-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Scrollable body ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
        {/* Sales Pipeline */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Sales Pipeline</h3>
            <Select
              value={contact.stage}
              onValueChange={v => onStageChange(contact.id, v as ContactStage)}
            >
              <SelectTrigger className="h-7 text-[11px] w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(STAGE_META) as [ContactStage, typeof STAGE_META[ContactStage]][]).map(
                  ([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <PipelineStepper stage={contact.stage} />
        </div>

        {/* About */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">About</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <AboutRow label="Full name"  value={contact.name}       icon={undefined} />
            <AboutRow label="Company"    value={contact.company}    icon={Building2} />
            <AboutRow label="Title"      value={contact.title}      icon={Pencil}    />
            <AboutRow label="Industry"   value={contact.industry}   icon={Tag}       />
            <AboutRow label="Location"   value={contact.location}   icon={MapPin}    />
            <AboutRow label="Employees"  value={contact.employees}  icon={Users}     />
            <AboutRow label="Funding"    value={contact.funding}    icon={Banknote}  />
            <AboutRow label="Source"     value={contact.source}     icon={Globe}     />
          </div>
        </div>

        {/* Tasks */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Tasks</h3>
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">
              <Plus className="size-3" /> Add Task
            </Button>
          </div>
          {linkedTasks.length === 0 ? (
            <div className="text-[11px] text-muted-foreground py-4 text-center border border-dashed border-border rounded-md">
              No tasks for this contact
            </div>
          ) : (
            <div className="space-y-2">
              {linkedTasks.map(t => (
                <div key={t.id} className="flex items-start gap-3 p-2.5 rounded-md border border-border hover:bg-surface">
                  {t.status === "completed"
                    ? <CheckCircle2 className="size-4 text-success mt-0.5 shrink-0" />
                    : <Circle className="size-4 text-muted-foreground mt-0.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium">{t.title}</div>
                    {t.dueDate && (
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                        <Calendar className="size-3" /> Due {t.dueDate}
                      </div>
                    )}
                  </div>
                  <StatusPill tone={t.priority === "high" ? "danger" : t.priority === "medium" ? "warning" : "neutral"}>
                    {t.priority}
                  </StatusPill>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Opportunities */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Opportunities</h3>
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">
              <Plus className="size-3" /> New
            </Button>
          </div>
          {contact.dealValue ? (
            <div className="rounded-md border border-border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-bold tabular-nums">{contact.dealValue}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{contact.company} deal</div>
                </div>
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", sm.color, sm.bg)}>
                  {sm.label}
                </span>
              </div>
              {(contact.closeDate || contact.demoDate) && (
                <div className="flex items-center gap-1 mt-3 text-[11px] text-muted-foreground">
                  <Calendar className="size-3" />
                  {contact.stage === "demo" ? "Demo: " : "Close: "}
                  {contact.demoDate || contact.closeDate}
                </div>
              )}
              {contact.intent && (
                <div className="mt-2">
                  <StatusPill tone={contact.intent === "High" ? "success" : contact.intent === "Medium" ? "warning" : "neutral"} dot>
                    {contact.intent} intent
                  </StatusPill>
                </div>
              )}
            </div>
          ) : (
            <div className="text-[11px] text-muted-foreground py-4 text-center border border-dashed border-border rounded-md">
              No opportunities yet
            </div>
          )}
        </div>

        {/* Activity */}
        {contact.lastActivity && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Last Activity</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="size-6 rounded-full bg-muted grid place-items-center shrink-0">
                <ClipboardList className="size-3" />
              </div>
              Updated {contact.lastActivity}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

function CRMContacts() {
  const [contacts, setContacts]           = useState<Contact[]>(CONTACTS);
  const [selectedId, setSelectedId]       = useState<string | null>(CONTACTS[0]?.id ?? null);
  const [search, setSearch]               = useState("");
  const [filterGroup, setFilterGroup]     = useState<string>("all");
  const [newOpen, setNewOpen]             = useState(false);
  const [deleteId, setDeleteId]           = useState<string | null>(null);
  const [form, setForm]                   = useState({ ...BLANK_FORM });

  const selectedContact = contacts.find(c => c.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    return contacts.filter(c => {
      if (filterGroup !== "all" && STAGE_META[c.stage].group !== filterGroup) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!`${c.name} ${c.company} ${c.email}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [contacts, search, filterGroup]);

  const tabCounts = useMemo(() => ({
    all:     contacts.length,
    contact: contacts.filter(c => STAGE_META[c.stage].group === "contact").length,
    lead:    contacts.filter(c => STAGE_META[c.stage].group === "lead").length,
    deal:    contacts.filter(c => STAGE_META[c.stage].group === "deal").length,
    won:     contacts.filter(c => STAGE_META[c.stage].group === "won").length,
    lost:    contacts.filter(c => STAGE_META[c.stage].group === "lost").length,
  }), [contacts]);

  function handleSave() {
    if (!form.name.trim() || !form.company.trim()) return;
    const initials = form.name.trim().split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
    const newContact: Contact = {
      id: `C-${String(contacts.length + 1).padStart(3, "0")}`,
      initials,
      icpScore: 0,
      lastActivity: "just now",
      ...form,
    };
    setContacts(prev => [newContact, ...prev]);
    setSelectedId(newContact.id);
    setNewOpen(false);
    setForm({ ...BLANK_FORM });
  }

  function handleDelete(id: string) {
    setContacts(prev => prev.filter(c => c.id !== id));
    if (selectedId === id) setSelectedId(filtered.find(c => c.id !== id)?.id ?? null);
    setDeleteId(null);
  }

  function handleStageChange(id: string, stage: ContactStage) {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, stage } : c));
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* ── LEFT: Contacts list panel ─────────────────────────────────── */}
      <div className="w-64 shrink-0 border-r border-border bg-sidebar flex flex-col overflow-hidden">
        {/* Panel header */}
        <div className="px-3 py-3 border-b border-border bg-card shrink-0">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold">Contacts</span>
              <span className="text-[10px] font-mono font-bold px-1.5 rounded bg-muted text-muted-foreground">
                {contacts.length}
              </span>
            </div>
            <Button size="sm" className="h-6 text-[10px] px-2" onClick={() => setNewOpen(true)}>
              <Plus className="size-3" /> Add
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="h-7 text-[11px] pl-7 bg-surface"
            />
          </div>
        </div>

        {/* Filter group tabs */}
        <div className="px-2.5 py-2 border-b border-border bg-card shrink-0 flex gap-1 flex-wrap">
          {FILTER_GROUPS.map(g => (
            <button
              key={g.key}
              onClick={() => setFilterGroup(g.key)}
              className={cn(
                "text-[9px] font-semibold px-2 py-0.5 rounded-full transition-colors",
                filterGroup === g.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {g.label}
              {g.key !== "all" && (
                <span className="ml-1 opacity-70">{tabCounts[g.key as keyof typeof tabCounts]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Contacts list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="text-[11px] text-muted-foreground text-center py-10">No contacts found</div>
          ) : filtered.map(c => {
            const sm     = STAGE_META[c.stage];
            const active = selectedId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-sidebar-accent transition-colors border-l-2",
                  active ? "bg-primary/5 border-l-primary" : "border-l-transparent"
                )}
              >
                <div className={cn(
                  "size-7 rounded-full grid place-items-center text-[10px] font-bold shrink-0 border",
                  active ? "bg-primary/15 text-primary border-primary/30" : "bg-muted text-muted-foreground border-border"
                )}>
                  {c.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={cn("text-[12px] font-semibold truncate", active && "text-primary")}>{c.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{c.company}</div>
                </div>
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0", sm.color, sm.bg)}>
                  {sm.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT: Contact detail panel ───────────────────────────────── */}
      {selectedContact ? (
        <ContactDetail
          key={selectedContact.id}
          contact={selectedContact}
          onStageChange={handleStageChange}
          onDelete={(id) => setDeleteId(id)}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="size-12 rounded-full bg-muted mx-auto grid place-items-center mb-3">
              <Target className="size-5 text-muted-foreground/50" />
            </div>
            <div className="text-sm font-medium">Select a contact</div>
            <div className="text-xs text-muted-foreground mt-1">Choose from the list to view details</div>
          </div>
        </div>
      )}

      {/* ── New Contact Dialog ────────────────────────────────────────── */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Contact</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2 max-h-[60vh] overflow-y-auto pr-1">
            {(
              [
                { key: "name",     label: "Full name *"  },
                { key: "company",  label: "Company *"    },
                { key: "title",    label: "Job title"    },
                { key: "email",    label: "Email"        },
                { key: "phone",    label: "Phone"        },
                { key: "location", label: "Location"     },
                { key: "industry", label: "Industry"     },
                { key: "source",   label: "Lead source"  },
              ] as { key: keyof typeof BLANK_FORM; label: string }[]
            ).map(({ key, label }) => (
              <div key={key} className="grid gap-1.5">
                <Label className="text-xs">{label}</Label>
                <Input
                  className="h-8 text-xs"
                  value={form[key] as string}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="grid gap-1.5">
              <Label className="text-xs">Pipeline stage</Label>
              <Select
                value={form.stage}
                onValueChange={v => setForm(f => ({ ...f, stage: v as ContactStage }))}
              >
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(STAGE_META) as [ContactStage, typeof STAGE_META[ContactStage]][]).map(
                    ([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              disabled={!form.name.trim() || !form.company.trim()}
              onClick={handleSave}
            >
              Create contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ────────────────────────────────────────────── */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Contact?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            <strong>{contacts.find(c => c.id === deleteId)?.name}</strong> will be permanently removed.
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => deleteId && handleDelete(deleteId)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
