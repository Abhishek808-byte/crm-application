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
import { Textarea } from "@/components/ui/textarea";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  CONTACTS, STAGE_META, TASKS,
  type Contact, type ContactStage,
} from "@/lib/erp-data";
import {
  Plus, Search, Mail, Phone, Globe, MapPin, Users, Banknote,
  CheckCircle2, Circle, Trash2, ChevronLeft, Building2,
  Calendar, BarChart3, Tag, Star, FileText, MessageSquare,
  UserPlus, Award, AlertCircle, X, LineChart,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useShell } from "@/lib/shell-store";

export const Route = createFileRoute("/app/crm/contacts")({
  component: CRMContacts,
});

// ── Label suggestions & helpers ───────────────────────────────────────────────

const LABEL_SUGGESTIONS = [
  "Affiliate",
  "Referral Partner",
  "Influencer",
  "Agency",
  "Strategic Partner",
];

const LABEL_PALETTE = [
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-pink-100 text-pink-700 border-pink-200",
  "bg-orange-100 text-orange-700 border-orange-200",
  "bg-teal-100 text-teal-700 border-teal-200",
  "bg-green-100 text-green-700 border-green-200",
  "bg-rose-100 text-rose-700 border-rose-200",
  "bg-yellow-100 text-yellow-700 border-yellow-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200",
];

function getLabelColor(label: string) {
  let h = 0;
  for (let i = 0; i < label.length; i++) h = label.charCodeAt(i) + ((h << 5) - h);
  return LABEL_PALETTE[Math.abs(h) % LABEL_PALETTE.length];
}

function ContactLabelsEditor({
  labels,
  onChange,
}: {
  labels: string[];
  onChange: (labels: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function addLabel(label: string) {
    const trimmed = label.trim();
    if (!trimmed || labels.includes(trimmed)) return;
    onChange([...labels, trimmed]);
    setInput("");
  }

  function removeLabel(label: string) {
    onChange(labels.filter(l => l !== label));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addLabel(input);
    } else if (e.key === "Backspace" && !input && labels.length > 0) {
      removeLabel(labels[labels.length - 1]);
    }
  }

  const remaining = LABEL_SUGGESTIONS.filter(s => !labels.includes(s));

  return (
    <div className="space-y-3">
      {/* Tag input row */}
      <div className="flex flex-wrap gap-1.5 items-center min-h-[32px] px-2.5 py-1.5 rounded-lg border border-border bg-surface focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/40 transition-all">
        {labels.map(label => (
          <span
            key={label}
            className={cn(
              "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border",
              getLabelColor(label)
            )}
          >
            {label}
            <button
              onClick={() => removeLabel(label)}
              className="hover:opacity-60 transition-opacity"
              type="button"
            >
              <X className="size-2.5" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={labels.length === 0 ? "Add a label…" : ""}
          className="flex-1 min-w-[80px] text-[11px] bg-transparent outline-none placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Suggestions */}
      {remaining.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {remaining.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => addLabel(s)}
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border border-dashed opacity-60 hover:opacity-100 hover:border-solid transition-all",
                getLabelColor(s)
              )}
            >
              <Plus className="size-2.5" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Stage metadata ────────────────────────────────────────────────────────────

const STEPPER_STAGES: ContactStage[] = [
  "new", "contacted", "qualified", "proposal_sent", "negotiation", "won",
];

const STEPPER_LABELS: Record<string, string> = {
  new:           "New",
  contacted:     "Contacted",
  qualified:     "Qualified",
  proposal_sent: "Proposal Sent",
  negotiation:   "Negotiation",
  won:           "Won",
};

const FILTER_OPTIONS = [
  { key: "all",     label: "All Contacts" },
  { key: "contact", label: "New"          },
  { key: "lead",    label: "Active"       },
  { key: "deal",    label: "Proposals"    },
  { key: "won",     label: "Won"          },
  { key: "lost",    label: "Lost"         },
] as const;

const BLANK_FORM = {
  name: "", title: "", company: "", domain: "", email: "",
  phone: "", location: "", industry: "", source: "", stage: "new" as ContactStage,
};

// ── Stage activity mock data ──────────────────────────────────────────────────

type ActivityEntry = {
  icon: React.FC<{ className?: string }>;
  title: string;
  time: string;
  fields: { label: string; value: string }[];
};

function getStageActivity(contact: Contact, stage: ContactStage): ActivityEntry[] {
  const name    = contact.name.split(" ")[0];
  const company = contact.company;
  switch (stage) {
    case "new":
      return [
        {
          icon: UserPlus,
          title: "Contact Created",
          time: "Jun 10, 2026",
          fields: [
            { label: "Full Name",  value: contact.name },
            { label: "Source",     value: contact.source || "Manual" },
            { label: "Added by",   value: "AI Assist" },
          ],
        },
      ];
    case "contacted":
      return [
        {
          icon: Mail,
          title: "Introductory Email Sent",
          time: "Jun 12, 2026",
          fields: [
            { label: "Subject",    value: `Introduction — we'd love to connect` },
            { label: "Sent to",    value: contact.email },
            { label: "Status",     value: "Opened (2×)" },
          ],
        },
        {
          icon: Phone,
          title: "Discovery Call",
          time: "Jun 14, 2026",
          fields: [
            { label: "Duration",   value: "25 min" },
            { label: "With",       value: `${name} · ${company}` },
            { label: "Outcome",    value: "Positive — requested proposal" },
          ],
        },
      ];
    case "qualified":
      return [
        {
          icon: CheckCircle2,
          title: "Lead Qualified",
          time: "Jun 15, 2026",
          fields: [
            { label: "ICP Score",       value: contact.icpScore > 0 ? `${contact.icpScore} / 100` : "Pending" },
            { label: "Decision maker",  value: "Confirmed" },
            { label: "Budget fit",      value: "Yes" },
            { label: "Industry",        value: contact.industry || "—" },
          ],
        },
      ];
    case "proposal_sent":
      return [
        {
          icon: FileText,
          title: "Proposal Delivered",
          time: "Jun 18, 2026",
          fields: [
            { label: "Document",   value: `Proposal_${company.replace(/\s/g, "_")}_v1.pdf` },
            { label: "Value",      value: contact.dealValue || "TBD" },
            { label: "Viewed",     value: "Yes (3×)" },
            { label: "Sent to",    value: contact.email },
          ],
        },
      ];
    case "negotiation":
      return [
        {
          icon: MessageSquare,
          title: "Negotiation Call",
          time: "Jun 20, 2026",
          fields: [
            { label: "Duration",   value: "45 min" },
            { label: "Topics",     value: "Pricing & contract terms" },
            { label: "Next step",  value: "Follow-up call Jun 25" },
          ],
        },
        {
          icon: FileText,
          title: "Counter-proposal Sent",
          time: "Jun 21, 2026",
          fields: [
            { label: "Revised value",  value: contact.dealValue || "TBD" },
            { label: "Changes",        value: "Payment terms updated" },
          ],
        },
      ];
    case "won":
      return [
        {
          icon: Award,
          title: "Deal Won",
          time: contact.closeDate || "Jun 28, 2026",
          fields: [
            { label: "Contract value",  value: contact.dealValue || "—" },
            { label: "Signed on",       value: contact.closeDate || "—" },
            { label: "Start date",      value: "Jul 1, 2026" },
          ],
        },
      ];
    case "lost":
      return [
        {
          icon: AlertCircle,
          title: "Lead Lost",
          time: "Jun 20, 2026",
          fields: [
            { label: "Reason",     value: "Budget constraints" },
            { label: "Feedback",   value: "May revisit next quarter" },
          ],
        },
      ];
    default:
      return [];
  }
}

// ── Stage icons for pipeline stepper ─────────────────────────────────────────

const STAGE_ICONS: Record<ContactStage, React.FC<{ className?: string }>> = {
  new:           UserPlus,
  contacted:     Mail,
  qualified:     CheckCircle2,
  proposal_sent: FileText,
  negotiation:   MessageSquare,
  won:           Award,
  lost:          AlertCircle,
};

// ── Pipeline Stepper (clickable, image-2 style) ───────────────────────────────

function PipelineStepper({
  stage,
  viewing,
  onView,
}: {
  stage: ContactStage;
  viewing: ContactStage;
  onView: (s: ContactStage) => void;
}) {
  const isLost     = stage === "lost";
  const currentIdx = STEPPER_STAGES.indexOf(stage);

  return (
    <div className="overflow-x-auto pb-2">
      {isLost && (
        <div className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-destructive/10 text-destructive">
          Lost — removed from active pipeline
        </div>
      )}
      <div className="flex items-start">
        {STEPPER_STAGES.map((s, i) => {
          const isDone    = !isLost && i < currentIdx;
          const isCurrent = !isLost && i === currentIdx;
          const isViewing = viewing === s;
          const StepIcon  = STAGE_ICONS[s];

          return (
            <div key={s} className="flex items-start">
              {/* Step column — clickable */}
              <button
                onClick={() => onView(s)}
                className={cn(
                  "flex flex-col items-center w-[82px] shrink-0 rounded-lg px-1 py-1 transition-colors",
                  isViewing ? "bg-primary/5" : "hover:bg-muted/50"
                )}
              >
                {/* Circle with icon */}
                <div className={cn(
                  "size-11 rounded-full grid place-items-center shrink-0 transition-all relative",
                  isDone
                    ? "bg-success text-white"
                    : isCurrent
                    ? "bg-orange-500 text-white"
                    : "bg-muted-foreground/15 text-muted-foreground/60",
                  isViewing && !isDone && !isCurrent && "ring-2 ring-primary/40"
                )}>
                  <StepIcon className="size-5" />
                  {/* Green checkmark overlay for completed */}
                  {isDone && (
                    <div className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-success border-2 border-background grid place-items-center">
                      <CheckCircle2 className="size-2.5 text-white" />
                    </div>
                  )}
                </div>
                {/* Label */}
                <div className={cn(
                  "text-[9px] mt-1.5 text-center leading-tight font-medium px-0.5 break-words w-full",
                  isDone    ? "text-success"
                  : isCurrent ? "text-foreground font-semibold"
                  : "text-muted-foreground"
                )}>
                  {STEPPER_LABELS[s]}
                </div>
                {/* Status badge */}
                <div className={cn(
                  "text-[8px] font-semibold px-1.5 py-0.5 rounded-full mt-1 whitespace-nowrap",
                  isDone      ? "bg-success/15 text-success"
                  : isCurrent  ? "bg-orange-100 text-orange-700"
                  : "bg-muted text-muted-foreground/70"
                )}>
                  {isDone ? "Completed" : isCurrent ? "In Progress" : "Pending"}
                </div>
              </button>

              {/* Connector line */}
              {i < STEPPER_STAGES.length - 1 && (
                <div className="flex-1 min-w-[14px] mt-[22px] shrink-0">
                  <div className={cn(
                    "h-0.5",
                    isDone ? "bg-success" : "border-t-2 border-dashed border-muted-foreground/25"
                  )} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Stage Activity Panel ──────────────────────────────────────────────────────

function StageActivityPanel({
  contact,
  stage,
  currentStage,
}: {
  contact: Contact;
  stage: ContactStage;
  currentStage: ContactStage;
}) {
  const activities  = getStageActivity(contact, stage);
  const stageIdx    = STEPPER_STAGES.indexOf(stage);
  const currentIdx  = STEPPER_STAGES.indexOf(currentStage);
  const isLost      = currentStage === "lost";
  const isDone      = !isLost && stageIdx < currentIdx;
  const isCurrent   = !isLost && stageIdx === currentIdx;
  const isPending   = isLost || stageIdx > currentIdx;

  return (
    <div className="border-b border-border">
      {/* Section title */}
      <div className="flex items-center gap-2 px-5 pt-3 pb-3">
        <span className="text-xs font-semibold">{STEPPER_LABELS[stage]} — Activity</span>
        <span className={cn(
          "text-[9px] font-bold px-2 py-0.5 rounded-full",
          isDone    ? "bg-success/15 text-success"
          : isCurrent ? "bg-orange-100 text-orange-700"
          : "bg-muted text-muted-foreground/70"
        )}>
          {isDone ? "Completed" : isCurrent ? "In Progress" : "Pending"}
        </span>
      </div>

      {isPending ? (
        <p className="text-[11px] text-muted-foreground px-5 py-2">
          No activity yet — this stage hasn't started.
        </p>
      ) : activities.length === 0 ? (
        <p className="text-[11px] text-muted-foreground px-5 py-2">No activity recorded.</p>
      ) : (
        <div className="border-y border-border bg-card overflow-hidden flex">
          {activities.map((act, i) => {
            const Icon = act.icon;
            return (
              <div key={i} className={cn(
                "flex-1 flex flex-col",
                i < activities.length - 1 && "border-r border-border"
              )}>
                {/* Header row */}
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                  <div className={cn(
                    "size-6 rounded grid place-items-center shrink-0",
                    isDone ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                  )}>
                    <Icon className="size-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold leading-tight">{act.title}</div>
                    <div className="text-[10px] text-muted-foreground">{act.time}</div>
                  </div>
                  {isDone && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-success/10 text-success shrink-0">Done</span>
                  )}
                </div>

                {/* Field rows — each is its own brick */}
                {act.fields.map(f => (
                  <div key={f.label} className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-border last:border-b-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
                      {f.label}
                    </span>
                    <span className="text-[11px] text-right">{f.value}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Contact Detail (flat layout, no card boxes) ───────────────────────────────

function ContactDetail({
  contact,
  onStageChange,
  onLabelsChange,
  onDelete,
  onBack,
}: {
  contact: Contact;
  onStageChange:  (id: string, stage: ContactStage) => void;
  onLabelsChange: (id: string, labels: string[]) => void;
  onDelete:       (id: string) => void;
  onBack:         () => void;
}) {
  const sm = STAGE_META[contact.stage];
  const linkedTasks = TASKS.filter(t => t.contactId === contact.id);

  const [viewingStage, setViewingStage] = useState<ContactStage>(contact.stage === "lost" ? "new" : contact.stage);
  const [showReview, setShowReview]     = useState(false);
  const [reviewText, setReviewText]     = useState("");

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="px-5 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <button
              onClick={onBack}
              className="size-7 rounded-md border border-border grid place-items-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 mt-0.5"
              title="Back to contacts"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div className="size-12 rounded-full bg-primary/10 text-primary grid place-items-center text-base font-bold shrink-0 border border-primary/20">
              {contact.initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-semibold">{contact.name}</h2>
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", sm.color, sm.bg)}>
                  {sm.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {[contact.title, contact.company].filter(Boolean).join(" · ")}
              </p>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary">
                    <Mail className="size-3" /> {contact.email}
                  </a>
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
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <LineChart className="size-3" /> Graph
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

      {/* ── Scrollable body ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">

        {/* ── Sales Pipeline + Activity (one block) ── */}
        <div className="px-5 pt-4 pb-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Sales Pipeline</h3>
            <Select
              value={contact.stage}
              onValueChange={v => onStageChange(contact.id, v as ContactStage)}
            >
              <SelectTrigger className="h-7 text-[11px] w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(STAGE_META) as [ContactStage, typeof STAGE_META[ContactStage]][]).map(
                  ([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <PipelineStepper
            stage={contact.stage}
            viewing={viewingStage}
            onView={setViewingStage}
          />
          <p className="text-[10px] text-muted-foreground mt-2">
            Click a stage to view its activity
          </p>
        </div>

        {/* ── Stage Activity (driven by which step the user clicked) ── */}
        <StageActivityPanel
          contact={contact}
          stage={viewingStage}
          currentStage={contact.stage}
        />

        {/* ── About ── */}
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">About</h3>
            <button
              onClick={() => setShowReview(v => !v)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
              title="Add review"
            >
              <Star className="size-3.5" />
              <span>Add Review</span>
            </button>
          </div>

          {/* Review input */}
          {showReview && (
            <div className="mb-4 rounded-lg border border-border bg-muted/30 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Your Review
              </div>
              <Textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Write a note or review about this contact…"
                className="text-xs min-h-[72px] resize-none"
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => { setShowReview(false); setReviewText(""); }}>
                  Cancel
                </Button>
                <Button size="sm" className="h-6 text-[10px]" disabled={!reviewText.trim()}>
                  Save
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-6 gap-y-0 divide-y divide-border/50">
            {/* Contact section */}
            <div className="col-span-2 pb-2 mb-1">
              <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Contact Info</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                <AboutField label="Full Name"  value={contact.name}      icon={undefined} />
                <AboutField label="Title"      value={contact.title}     icon={undefined} />
                <AboutField label="Email"      value={contact.email}     icon={Mail}      />
                <AboutField label="Phone"      value={contact.phone}     icon={Phone}     />
                <AboutField label="Location"   value={contact.location}  icon={MapPin}    />
                <AboutField label="Source"     value={contact.source}    icon={Globe}     />
              </div>
            </div>

            {/* Company section */}
            <div className="col-span-2 pt-3">
              <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Company Info</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                <AboutField label="Company"    value={contact.company}   icon={Building2} />
                <AboutField label="Industry"   value={contact.industry}  icon={Tag}       />
                <AboutField label="Employees"  value={contact.employees} icon={Users}     />
                <AboutField label="Funding"    value={contact.funding}   icon={Banknote}  />
                <AboutField label="Website"    value={contact.domain}    icon={Globe}     />
              </div>
            </div>
          </div>
        </div>

        {/* ── Labels & Tags ── */}
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="size-3.5 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Labels & Tags</h3>
          </div>
          <ContactLabelsEditor
            labels={contact.labels ?? []}
            onChange={labels => onLabelsChange(contact.id, labels)}
          />
          <p className="text-[10px] text-muted-foreground mt-2">
            Press Enter or comma to add a custom label · click suggestions to apply
          </p>
        </div>

        {/* ── Tasks ── */}
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Tasks</h3>
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">
              <Plus className="size-3" /> Add Task
            </Button>
          </div>
          {linkedTasks.length === 0 ? (
            <p className="text-[11px] text-muted-foreground py-2">No tasks for this contact</p>
          ) : (
            <div className="space-y-0 divide-y divide-border/50">
              {linkedTasks.map(t => (
                <div key={t.id} className="flex items-start gap-3 py-2.5">
                  {t.status === "completed"
                    ? <CheckCircle2 className="size-4 text-success mt-0.5 shrink-0" />
                    : <Circle      className="size-4 text-muted-foreground mt-0.5 shrink-0" />}
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

        {/* ── Deal / Opportunity ── */}
        {contact.dealValue && (
          <div className="px-5 py-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Deal</h3>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-bold tabular-nums">{contact.dealValue}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{contact.company}</div>
                {contact.closeDate && (
                  <div className="flex items-center gap-1 mt-1.5 text-[11px] text-muted-foreground">
                    <Calendar className="size-3" /> Close: {contact.closeDate}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", sm.color, sm.bg)}>
                  {sm.label}
                </span>
                {contact.intent && (
                  <StatusPill tone={contact.intent === "High" ? "success" : contact.intent === "Medium" ? "warning" : "neutral"} dot>
                    {contact.intent} intent
                  </StatusPill>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function AboutField({
  label, value, icon: Icon,
}: {
  label: string;
  value?: string;
  icon?: React.FC<{ className?: string }>;
}) {
  if (!value) return null;
  return (
    <div>
      <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="flex items-center gap-1 mt-0.5">
        {Icon && <Icon className="size-3 text-muted-foreground shrink-0" />}
        <span className="text-xs">{value}</span>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

function CRMContacts() {
  const [contacts, setContacts]       = useState<Contact[]>(CONTACTS);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [search, setSearch]           = useState("");
  const [filterKey, setFilterKey]     = useState<string>("all");
  const [newOpen, setNewOpen]         = useState(false);
  const [deleteId, setDeleteId]       = useState<string | null>(null);
  const [form, setForm]               = useState({ ...BLANK_FORM });

  const selectedContact = contacts.find(c => c.id === selectedId) ?? null;
  const setSidebarCollapsed = useShell(s => s.setSidebarCollapsed);

  useEffect(() => {
    setSidebarCollapsed(!!selectedId);
    return () => setSidebarCollapsed(false);
  }, [selectedId, setSidebarCollapsed]);

  const filtered = useMemo(() => {
    return contacts.filter(c => {
      if (filterKey !== "all" && STAGE_META[c.stage].group !== filterKey) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!`${c.name} ${c.company} ${c.email}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [contacts, search, filterKey]);

  const tabCounts = useMemo(() => ({
    all:     contacts.length,
    contact: contacts.filter(c => STAGE_META[c.stage].group === "contact").length,
    lead:    contacts.filter(c => STAGE_META[c.stage].group === "lead").length,
    deal:    contacts.filter(c => STAGE_META[c.stage].group === "deal").length,
    won:     contacts.filter(c => STAGE_META[c.stage].group === "won").length,
    lost:    contacts.filter(c => STAGE_META[c.stage].group === "lost").length,
  }), [contacts]);

  const filterLabel = useMemo(() => {
    const opt = FILTER_OPTIONS.find(o => o.key === filterKey);
    const count = filterKey === "all" ? contacts.length : tabCounts[filterKey as keyof typeof tabCounts];
    return `${opt?.label ?? "All"} (${count})`;
  }, [filterKey, tabCounts, contacts.length]);

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
    if (selectedId === id) setSelectedId(null);
    setDeleteId(null);
  }

  function handleStageChange(id: string, stage: ContactStage) {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, stage } : c));
  }

  function handleLabelsChange(id: string, labels: string[]) {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, labels } : c));
  }

  return (
    <div className="flex-1 flex overflow-hidden">

      {/* ── LEFT: Contacts panel ─────────────────────────────────────────── */}
      <div className={cn(
        "flex flex-col overflow-hidden border-r border-border bg-background transition-all duration-200",
        selectedContact ? "w-72 shrink-0" : "flex-1"
      )}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-card shrink-0">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Contacts</span>
              <span className="text-[10px] font-mono font-bold px-1.5 rounded bg-muted text-muted-foreground">
                {contacts.length}
              </span>
            </div>
            <Button size="sm" className="h-7 text-xs px-2.5" onClick={() => setNewOpen(true)}>
              <Plus className="size-3" /> New Contact
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search contacts…"
              className="h-7 text-[11px] pl-7 bg-surface"
            />
          </div>

          {/* Filter — dropdown */}
          <Select value={filterKey} onValueChange={setFilterKey}>
            <SelectTrigger className="h-7 text-[11px] w-full bg-surface">
              <SelectValue>{filterLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPTIONS.map(opt => (
                <SelectItem key={opt.key} value={opt.key} className="text-xs">
                  <span>{opt.label}</span>
                  <span className="ml-2 text-muted-foreground">
                    ({opt.key === "all" ? contacts.length : tabCounts[opt.key as keyof typeof tabCounts]})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Contact list */}
        {selectedContact ? (
          /* Compact list with full names (when detail open) */
          <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-border">
            {filtered.map(c => {
              const sm     = STAGE_META[c.stage];
              const active = selectedId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-sidebar-accent transition-colors border-l-2",
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
                    <div className={cn("text-[11px] font-semibold truncate", active && "text-primary")}>{c.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{c.company}</div>
                  </div>
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0", sm.color, sm.bg)}>
                    {sm.label}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          /* Full contacts table */
          <div className="flex-1 overflow-auto scrollbar-thin">
            <table className="w-full">
              <thead className="sticky top-0 bg-card border-b border-border z-10">
                <tr>
                  <th className="px-4 py-2.5 text-left w-10">
                    <input type="checkbox" className="rounded border-border" />
                  </th>
                  {["Name", "Company", "Title", "Stage", "ICP", "Source", "Activity", "Tags"].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center text-sm text-muted-foreground">
                      No contacts found
                    </td>
                  </tr>
                ) : filtered.map(c => {
                  const sm = STAGE_META[c.stage];
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-border hover:bg-surface transition-colors cursor-pointer group"
                      onClick={() => setSelectedId(c.id)}
                    >
                      <td className="px-4 py-3 w-10" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-border" />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-full grid place-items-center text-[11px] font-bold shrink-0 border bg-primary/10 text-primary border-primary/20">
                            {c.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold truncate">{c.name}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-xs font-medium truncate">{c.company}</div>
                        {c.industry && <div className="text-[10px] text-muted-foreground truncate">{c.industry}</div>}
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-xs text-muted-foreground truncate max-w-[120px]">{c.title || "—"}</div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={cn(
                          "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          sm.color, sm.bg
                        )}>
                          <span className="size-1.5 rounded-full bg-current" />
                          {sm.label}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {c.icpScore > 0 ? (
                          <StatusPill tone={c.icpScore >= 70 ? "success" : c.icpScore >= 40 ? "warning" : "danger"}>
                            {c.icpScore}
                          </StatusPill>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-[10px] text-muted-foreground">{c.source || "—"}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-[10px] text-muted-foreground">{c.lastActivity || "—"}</span>
                      </td>
                      <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="flex flex-wrap gap-1 items-center min-h-[22px] group/tag">
                              {c.labels && c.labels.length > 0 ? (
                                <>
                                  {c.labels.slice(0, 2).map(label => (
                                    <span
                                      key={label}
                                      className={cn(
                                        "inline-flex items-center text-[9px] font-semibold px-1.5 py-0.5 rounded-full border",
                                        getLabelColor(label)
                                      )}
                                    >
                                      {label}
                                    </span>
                                  ))}
                                  {c.labels.length > 2 && (
                                    <span className="text-[9px] text-muted-foreground font-medium">+{c.labels.length - 2}</span>
                                  )}
                                </>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/40 group-hover/tag:text-primary transition-colors">
                                  <Plus className="size-2.5" /> Add
                                </span>
                              )}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 p-3" align="start">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                              Labels for {c.name.split(" ")[0]}
                            </div>
                            <ContactLabelsEditor
                              labels={c.labels ?? []}
                              onChange={labels => handleLabelsChange(c.id, labels)}
                            />
                          </PopoverContent>
                        </Popover>
                      </td>
                      <td className="px-3 py-3 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => setSelectedId(c.id)}>
                            Open
                          </Button>
                          <button
                            onClick={() => setDeleteId(c.id)}
                            className="size-6 grid place-items-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── RIGHT: Contact detail ─────────────────────────────────────────── */}
      {selectedContact && (
        <ContactDetail
          key={selectedContact.id}
          contact={selectedContact}
          onStageChange={handleStageChange}
          onLabelsChange={handleLabelsChange}
          onDelete={(id) => setDeleteId(id)}
          onBack={() => setSelectedId(null)}
        />
      )}

      {/* ── New Contact Dialog ────────────────────────────────────────────── */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Contact</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2 max-h-[60vh] overflow-y-auto pr-1">
            {(
              [
                { key: "name",     label: "Full name *" },
                { key: "company",  label: "Company *"   },
                { key: "title",    label: "Job title"   },
                { key: "email",    label: "Email"       },
                { key: "phone",    label: "Phone"       },
                { key: "location", label: "Location"    },
                { key: "industry", label: "Industry"    },
                { key: "source",   label: "Lead source" },
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
              <Select value={form.stage} onValueChange={v => setForm(f => ({ ...f, stage: v as ContactStage }))}>
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
            <Button size="sm" disabled={!form.name.trim() || !form.company.trim()} onClick={handleSave}>
              Create contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ────────────────────────────────────────────────── */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Contact?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            <strong>{contacts.find(c => c.id === deleteId)?.name}</strong> will be permanently removed.
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
