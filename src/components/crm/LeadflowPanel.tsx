import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Check, Sparkles, Shield, Mail, Reply, Calendar, Clock, Activity,
  Trophy, XCircle, ChevronLeft,
} from "lucide-react";

type StepState = "done" | "current" | "upcoming";
type TagKind = "ai" | "email" | "stage" | "wait" | "done";
type IconKey = "check" | "spark" | "shield" | "mail" | "reply" | "cal" | "clock";

interface Step {
  id: string;
  icon: IconKey;
  state: StepState;
  label: string;
  when: string;
  meta: string;
  tags: [TagKind, string][];
  body?: string;
  email?: { subject: string; preview: string };
}

const ICON_MAP: Record<IconKey, typeof Check> = {
  check: Check, spark: Sparkles, shield: Shield,
  mail: Mail, reply: Reply, cal: Calendar, clock: Clock,
};

const TAG_CLASS: Record<TagKind, string> = {
  ai:    "bg-primary/10 text-primary",
  email: "bg-accent text-accent-foreground",
  stage: "bg-muted text-muted-foreground border border-border",
  wait:  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  done:  "bg-success/10 text-success",
};

const REPLY_PATH: Step[] = [
  { id: "added", icon: "check",  state: "done",    label: "Contact Added",           when: "6d ago", meta: "via Cold Outreach", tags: [["done","Done"]], body: "Contact created from a Cold Outreach import batch." },
  { id: "icp",   icon: "spark",  state: "done",    label: "ICP Generated",           when: "6d ago", meta: "AI Kruise scored fit at 62%", tags: [["ai","AI KRUISE"],["done","Done"]], body: "AI scored ICP fit using firmographics + role match." },
  { id: "gate",  icon: "shield", state: "done",    label: "ICP Review",              when: "6d ago", meta: "Approved by you", tags: [["done","Approved"]], body: "You approved the ICP score and released for outreach." },
  { id: "draft", icon: "spark",  state: "done",    label: "Discovery Email Drafted", when: "5d ago", meta: "AI Kruise drafted opener", tags: [["ai","AI KRUISE"]], body: "Personalized opener drafted using the Discovery v2 template.", email: { subject: "Quick question about your outbound stack", preview: "Hi Shradha — noticed your team recently expanded. We help teams like yours cut manual outreach time by 60%…" } },
  { id: "sent",  icon: "mail",   state: "done",    label: "Discovery Email Sent",    when: "5d ago", meta: "Opened twice · no click", tags: [["email","EMAIL"],["stage","Contacted"]], body: "Delivered. 2 opens across desktop + mobile. No link clicks yet.", email: { subject: "Quick question about your outbound stack", preview: "Hi Shradha — noticed your team recently expanded…" } },
  { id: "reply", icon: "reply",  state: "current", label: "Reply Received",          when: "2h ago", meta: "\u201CSounds interesting — can we talk Thu?\u201D", tags: [["stage","Engaged"]], body: "Positive intent detected. Awaiting your calendar invite.", email: { subject: "Re: Quick question about your outbound stack", preview: "Sounds interesting — can we talk Thu around 3pm IST?" } },
  { id: "meet",  icon: "cal",    state: "upcoming", label: "Meeting Scheduled",       when: "next",   meta: "Send calendar invite + agenda", tags: [["email","EMAIL"],["stage","Meeting Scheduled"]] },
  { id: "demo",  icon: "cal",    state: "upcoming", label: "Demo Completed",          when: "—",      meta: "Post-demo recap + product deck", tags: [["email","EMAIL"],["stage","Demo Completed"]] },
  { id: "price", icon: "mail",   state: "upcoming", label: "Proposal Sent",           when: "—",      meta: "Pricing doc + ROI summary", tags: [["email","EMAIL"],["stage","Proposal Sent"]] },
  { id: "nego",  icon: "reply",  state: "upcoming", label: "Negotiating",             when: "—",      meta: "Revised proposal / objection handling", tags: [["email","EMAIL"],["stage","Negotiating"]] },
];

const NOREPLY_PATH: Step[] = [
  { id: "added", icon: "check",  state: "done",    label: "Contact Added",           when: "6d ago", meta: "via Cold Outreach", tags: [["done","Done"]] },
  { id: "icp",   icon: "spark",  state: "done",    label: "ICP Generated",           when: "6d ago", meta: "AI Kruise scored fit at 62%", tags: [["ai","AI KRUISE"],["done","Done"]] },
  { id: "gate",  icon: "shield", state: "done",    label: "ICP Review",              when: "6d ago", meta: "Approved by you", tags: [["done","Approved"]] },
  { id: "draft", icon: "spark",  state: "done",    label: "Discovery Email Drafted", when: "5d ago", meta: "AI Kruise drafted opener", tags: [["ai","AI KRUISE"]] },
  { id: "sent",  icon: "mail",   state: "done",    label: "Discovery Email Sent",    when: "5d ago", meta: "No open · no reply", tags: [["email","EMAIL"],["stage","Contacted"]], email: { subject: "Quick question about your outbound stack", preview: "Hi Shradha — noticed your team recently expanded…" } },
  { id: "f1",    icon: "mail",   state: "done",    label: "Follow-up 1",             when: "2d ago", meta: "Different angle / value hook", tags: [["email","EMAIL"],["stage","Follow-up 1"]], email: { subject: "One more thought", preview: "Wanted to share how a similar team saved 12 hrs/week…" } },
  { id: "f2",    icon: "mail",   state: "current", label: "Follow-up 2",             when: "today",  meta: "Case study / social proof · waiting 5d", tags: [["email","EMAIL"],["wait","WAIT 5D"],["stage","Follow-up 2"]], email: { subject: "How Acme cut outbound time by 60%", preview: "Thought this case study might resonate given your setup…" } },
  { id: "f3",    icon: "mail",   state: "upcoming", label: "Follow-up 3",             when: "in 5d",  meta: "\u201CLast reach out\u201D / breakup tone", tags: [["email","EMAIL"],["stage","Follow-up 3"]] },
  { id: "dead",  icon: "clock",  state: "upcoming", label: "Closed — No Response",    when: "day 17", meta: "Archived · re-enters 90-day campaign", tags: [["stage","Inactive"]] },
];

function Tag({ k, v }: { k: TagKind; v: string }) {
  return (
    <span className={cn(
      "text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
      TAG_CLASS[k],
    )}>{v}</span>
  );
}

function StepNode({
  step, last, selected, onSelect,
}: {
  step: Step; last: boolean; selected: boolean; onSelect: () => void;
}) {
  const Icon = step.state === "done" ? Check : ICON_MAP[step.icon];
  const isCurrent = step.state === "current";
  const isDone    = step.state === "done";
  const isUp      = step.state === "upcoming";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative w-full text-left pl-10 pr-2 pb-3 min-h-[56px] group",
        "focus:outline-none",
      )}
    >
      {/* rail */}
      {!last && (
        <span
          aria-hidden
          className={cn(
            "absolute left-[15px] top-[26px] bottom-[-6px] w-0.5",
            isDone ? "bg-success" : isCurrent ? "bg-gradient-to-b from-primary to-border" : "bg-border",
          )}
        />
      )}
      {/* node */}
      <span
        className={cn(
          "absolute left-0.5 top-0.5 size-7 rounded-full grid place-items-center border-2 z-10 transition-colors",
          isDone    && "bg-success border-success text-white",
          isCurrent && "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20",
          isUp      && "bg-card border-border text-muted-foreground",
        )}
      >
        <Icon className="size-3.5" strokeWidth={isDone ? 3 : 2} />
      </span>

      <div className={cn(
        "rounded-md px-2 py-1 -mx-2 transition-colors",
        isUp && "opacity-55",
        selected && "bg-accent",
        !selected && "group-hover:bg-muted/50",
      )}>
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            "text-[13px] font-semibold leading-tight",
            isCurrent ? "text-primary" : "text-foreground",
          )}>{step.label}</span>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{step.when}</span>
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{step.meta}</div>
        {step.tags.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {step.tags.map(([k, v], i) => <Tag key={i} k={k} v={v} />)}
          </div>
        )}
      </div>
    </button>
  );
}

export function LeadflowPanel() {
  const [branch, setBranch] = useState<"reply" | "noreply">("reply");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<"won" | "lost" | null>(null);

  const steps = branch === "reply" ? REPLY_PATH : NOREPLY_PATH;
  const doneCount = steps.filter(s => s.state === "done").length;

  const selectedStep = selectedId ? steps.find(s => s.id === selectedId) ?? null : null;

  function switchBranch(b: "reply" | "noreply") {
    setBranch(b);
    setSelectedId(null);
    setOutcome(null);
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Activity className="size-4 text-primary shrink-0" />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-tight">Leadflow · Email Pipeline</h3>
            <p className="text-[11px] text-muted-foreground leading-tight">Live journey for this contact</p>
          </div>
        </div>
        <div className="text-[10px] text-muted-foreground tabular-nums shrink-0">
          {doneCount}/{steps.length} steps
        </div>
      </div>

      {/* Branch toggle (preview only) */}
      <div className="px-4 pt-3">
        <div className="flex gap-1 p-1 rounded-md bg-muted/50 border border-border">
          <button
            onClick={() => switchBranch("reply")}
            className={cn(
              "flex-1 text-[11px] font-semibold py-1.5 rounded transition-colors",
              branch === "reply" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >Replied path</button>
          <button
            onClick={() => switchBranch("noreply")}
            className={cn(
              "flex-1 text-[11px] font-semibold py-1.5 rounded transition-colors",
              branch === "noreply" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >No-reply path</button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          Preview toggle — in production the reply detector picks the branch automatically.
        </p>
      </div>

      {/* Two-column: rail + detail */}
      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-0">
        {/* Rail */}
        <div className="p-4 md:border-r border-border">
          <div className={cn(
            "inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-dashed mb-3",
            branch === "reply"
              ? "text-success border-success/40 bg-success/10"
              : "text-warning border-warning/40 bg-warning/10",
          )}>
            <span className={cn(
              "size-1.5 rounded-full",
              branch === "reply" ? "bg-success" : "bg-warning",
            )} />
            {branch === "reply" ? "Branch A — Got a reply" : "Branch B — Nurture sequence"}
          </div>

          <div>
            {steps.map((s, i) => (
              <StepNode
                key={s.id}
                step={s}
                last={i === steps.length - 1 && branch !== "reply"}
                selected={selectedId === s.id}
                onSelect={() => setSelectedId(s.id === selectedId ? null : s.id)}
              />
            ))}
          </div>

          {branch === "reply" && (
            <div className="pl-10 mt-1">
              <div className="inline-flex text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 border border-dashed border-border rounded-full px-2.5 py-0.5 mb-2">
                Outcome
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setOutcome(outcome === "won" ? null : "won")}
                  className={cn(
                    "flex-1 rounded-md border p-2.5 text-center transition-all",
                    outcome === "won"
                      ? "border-success bg-success/10 ring-2 ring-success/20"
                      : "border-success/40 bg-card hover:bg-success/5",
                  )}
                >
                  <Trophy className="size-4 text-success mx-auto mb-1" />
                  <div className="text-[12px] font-bold text-success">Deal Won</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Welcome + onboarding</div>
                </button>
                <button
                  onClick={() => setOutcome(outcome === "lost" ? null : "lost")}
                  className={cn(
                    "flex-1 rounded-md border p-2.5 text-center transition-all",
                    outcome === "lost"
                      ? "border-destructive bg-destructive/10 ring-2 ring-destructive/20"
                      : "border-destructive/40 bg-card hover:bg-destructive/5",
                  )}
                >
                  <XCircle className="size-4 text-destructive mx-auto mb-1" />
                  <div className="text-[12px] font-bold text-destructive">Deal Lost</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Breakup · revisit 3mo</div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="p-4 bg-surface/40 min-h-[280px]">
          {selectedStep ? (
            <StepDetail step={selectedStep} onBack={() => setSelectedId(null)} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-muted-foreground py-8">
              <Activity className="size-6 opacity-40" />
              <div className="text-xs">Click any step to view its activity</div>
              <div className="text-[10px] opacity-70">Emails, timestamps, and stage transitions</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepDetail({ step, onBack }: { step: Step; onBack: () => void }) {
  const Icon = ICON_MAP[step.icon];
  const stateTone =
    step.state === "done" ? "text-success"
    : step.state === "current" ? "text-primary"
    : "text-muted-foreground";

  return (
    <div className="space-y-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-3" /> Back
      </button>

      <div className="flex items-start gap-3">
        <div className={cn(
          "size-9 rounded-full grid place-items-center border-2 shrink-0",
          step.state === "done" && "bg-success border-success text-white",
          step.state === "current" && "bg-primary border-primary text-primary-foreground",
          step.state === "upcoming" && "bg-card border-border text-muted-foreground",
        )}>
          <Icon className="size-4" strokeWidth={step.state === "done" ? 3 : 2} />
        </div>
        <div className="min-w-0">
          <div className={cn("text-sm font-semibold", stateTone)}>{step.label}</div>
          <div className="text-[11px] text-muted-foreground">{step.when}</div>
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {step.tags.map(([k, v], i) => <Tag key={i} k={k} v={v} />)}
          </div>
        </div>
      </div>

      <p className="text-xs text-foreground/80 leading-relaxed">
        {step.body ?? step.meta}
      </p>

      {step.email && (
        <div className="rounded-md border border-border bg-card p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            <Mail className="size-3" /> Email
          </div>
          <div className="text-xs font-semibold">{step.email.subject}</div>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed line-clamp-3">
            {step.email.preview}
          </p>
        </div>
      )}
    </div>
  );
}
