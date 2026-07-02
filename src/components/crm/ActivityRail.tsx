import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Activity, UserPlus, Sparkles, ShieldCheck, FileEdit, Send, Clock,
  Reply, Calendar, Presentation, FileText, Handshake, Trophy, XCircle,
  MailPlus, Archive, ChevronDown, Mail, CheckCircle2,
} from "lucide-react";

type ActState = "done" | "current" | "upcoming" | "terminal-good" | "terminal-bad";
type Branch = "reply" | "noreply";

interface ActStep {
  id: string;
  label: string;
  sub: string;
  when: string;
  state: ActState;
  icon: typeof UserPlus;
  stage?: string;
  detail: string;
  email?: { subject: string; preview: string };
}

const SHARED: ActStep[] = [
  { id: "added", label: "Contact Added", sub: "via Cold Outreach", when: "6d ago",
    state: "done", icon: UserPlus, stage: "Prospecting",
    detail: "Imported into the CRM from the Cold Outreach batch. Enriched with LinkedIn + Clearbit signals." },
  { id: "icp", label: "ICP Generated", sub: "AI Kruise scored fit", when: "6d ago",
    state: "done", icon: Sparkles, stage: "ICP Pending",
    detail: "AI Kruise scored role, industry and firmographic fit. Score: 82 / 100 — strong match." },
  { id: "review", label: "ICP Review", sub: "Manual approval", when: "5d ago",
    state: "done", icon: ShieldCheck, stage: "ICP Approved",
    detail: "You approved the ICP score and released the contact into the outreach sequence." },
  { id: "drafted", label: "Discovery Email Drafted", sub: "AI Kruise · Discovery v2", when: "5d ago",
    state: "done", icon: FileEdit,
    detail: "Personalized opener drafted from the Discovery v2 template using the enriched profile." },
  { id: "sent", label: "Discovery Email Sent", sub: "Waiting for reply", when: "5d ago",
    state: "done", icon: Send, stage: "Contacted",
    detail: "Delivered and tracked. 2 opens registered. 3-day wait window before follow-up branches.",
    email: {
      subject: "Quick question about your outbound stack",
      preview: "Hi Shradha — noticed your team recently expanded. We help teams like yours cut manual outreach time by 60%…",
    }},
  { id: "wait", label: "Wait Window", sub: "3 days · deciding branch", when: "2d ago",
    state: "done", icon: Clock,
    detail: "System waits 3 days after the discovery send. If a reply arrives, flow switches to Reply branch. Otherwise it enters the Follow-up nurture branch." },
];

const REPLY_BRANCH: ActStep[] = [
  { id: "reply", label: "Reply Received", sub: "Positive intent", when: "1d ago",
    state: "current", icon: Reply, stage: "Engaged",
    detail: "Contact responded showing interest. Auto-acknowledgment queued with a meeting-scheduling link.",
    email: { subject: "Re: Quick question about your outbound stack",
      preview: "Thanks for reaching out — this is timely. Happy to jump on a quick call next week…" }},
  { id: "meeting", label: "Meeting Confirmed", sub: "Calendar invite sent", when: "in 2d",
    state: "upcoming", icon: Calendar, stage: "Meeting Scheduled",
    detail: "Calendar invite + agenda dispatched. Contact enters the Sales pipeline once meeting is confirmed.",
    email: { subject: "Confirmed: Discovery call — Thu 3:00pm",
      preview: "Sharing the agenda + a short intro deck ahead of our call. Looking forward to it…" }},
  { id: "demo", label: "Demo Completed", sub: "Recap + product deck", when: "—",
    state: "upcoming", icon: Presentation, stage: "Demo Completed",
    detail: "Post-demo recap email with the product deck and next-step suggestions." },
  { id: "pricing", label: "Pricing Sent", sub: "Proposal + ROI summary", when: "—",
    state: "upcoming", icon: FileText, stage: "Proposal Sent",
    detail: "Pricing document with an ROI summary tailored to team size and current tooling." },
  { id: "nego", label: "Negotiation", sub: "Objection handling", when: "—",
    state: "upcoming", icon: Handshake, stage: "Negotiating",
    detail: "Revised proposal + objection handling. Outcome forks into Won or Lost." },
  { id: "won", label: "Deal Won", sub: "Welcome + onboarding", when: "—",
    state: "terminal-good", icon: Trophy, stage: "Won",
    detail: "Welcome email sent with onboarding next steps. Contact moves to Customer Success.",
    email: { subject: "Welcome aboard 🎉",
      preview: "Excited to have you with us. Here's what to expect in your first week…" }},
  { id: "lost", label: "Deal Lost", sub: "Breakup · revisit in 3mo", when: "—",
    state: "terminal-bad", icon: XCircle, stage: "Lost",
    detail: "Polite breakup email sent. Contact re-enters the nurture pool for a 3-month revisit.",
    email: { subject: "Closing the loop — for now",
      preview: "Totally understand the timing isn't right. I'll circle back in a few months…" }},
];

const NOREPLY_BRANCH: ActStep[] = [
  { id: "f1", label: "Follow-up 1", sub: "Day 3 · different angle", when: "3d ago",
    state: "done", icon: MailPlus, stage: "Follow-up 1",
    detail: "Nudge with a fresh value hook. 4-day wait before the next touch.",
    email: { subject: "One more thought",
      preview: "Wanted to share a quick angle — a peer team saved 12 hrs/week on outbound research…" }},
  { id: "f2", label: "Follow-up 2", sub: "Day 7 · social proof", when: "today",
    state: "current", icon: MailPlus, stage: "Follow-up 2",
    detail: "Case-study driven touch. 5-day wait before the last attempt.",
    email: { subject: "How Acme's team hit 3x reply rate",
      preview: "Short case study on a team roughly your size — the specific play that moved the needle…" }},
  { id: "f3", label: "Follow-up 3", sub: "Day 12 · breakup tone", when: "in 5d",
    state: "upcoming", icon: MailPlus, stage: "Follow-up 3",
    detail: "Last-reach-out with a breakup tone. Often gets the highest reply rate of the sequence.",
    email: { subject: "Should I close your file?",
      preview: "Haven't heard back — happy to pause things on my end unless the timing changes…" }},
  { id: "inactive", label: "Closed — No Response", sub: "Archived · 90-day revisit", when: "in 10d",
    state: "terminal-bad", icon: Archive, stage: "Inactive",
    detail: "Contact archived after Day 17 with no response. Automatically re-enters a 90-day nurture campaign." },
];

export function ActivityRail() {
  const [branch, setBranch] = useState<Branch>("reply");
  const [openId, setOpenId] = useState<string | null>("reply");

  const steps = [...SHARED, ...(branch === "reply" ? REPLY_BRANCH : NOREPLY_BRANCH)];
  const doneCount = steps.filter(s => s.state === "done").length;

  const switchBranch = (b: Branch) => {
    setBranch(b);
    setOpenId(b === "reply" ? "reply" : "f2");
  };

  return (
    <div className="rounded-lg border border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Activity className="size-3.5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Activity Pipeline
          </span>
        </div>
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-success/15 text-success flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-success animate-pulse" /> Live
        </span>
      </div>

      {/* Branch toggle */}
      <div className="px-3 pt-2.5 pb-2">
        <div className="grid grid-cols-2 gap-1 p-0.5 rounded-md bg-muted/60">
          <button
            onClick={() => switchBranch("reply")}
            className={cn(
              "text-[10px] font-semibold py-1.5 rounded transition-colors flex items-center justify-center gap-1",
              branch === "reply"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Reply className="size-3" /> Reply path
          </button>
          <button
            onClick={() => switchBranch("noreply")}
            className={cn(
              "text-[10px] font-semibold py-1.5 rounded transition-colors flex items-center justify-center gap-1",
              branch === "noreply"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <MailPlus className="size-3" /> No-reply path
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 text-[9px] text-muted-foreground">
          <span className="font-semibold uppercase tracking-wider">
            {branch === "reply" ? "Prospecting → Won / Lost" : "Prospecting → Nurture"}
          </span>
          <span>{doneCount}/{steps.length} complete</span>
        </div>
      </div>

      {/* Scrollable rail */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-2">
        {steps.map((s, i) => {
          const isOpen = openId === s.id;
          const Icon = s.icon;
          const last = i === steps.length - 1;
          const isDone = s.state === "done";
          const isCurrent = s.state === "current";
          const isUp = s.state === "upcoming";
          const isWon = s.state === "terminal-good";
          const isBad = s.state === "terminal-bad";

          return (
            <div key={s.id} className="relative">
              {!last && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-[15px] top-8 bottom-0 w-0.5",
                    isDone ? "bg-success/60" : "bg-border",
                  )}
                />
              )}

              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : s.id)}
                className={cn(
                  "relative w-full text-left flex items-start gap-2.5 py-2 pr-1.5 pl-0 rounded-md transition-colors",
                  "hover:bg-muted/40",
                  isOpen && "bg-accent",
                )}
              >
                <div className={cn(
                  "size-8 rounded-full grid place-items-center border-2 shrink-0 z-10 relative",
                  isDone && "bg-success border-success text-white",
                  isCurrent && "bg-primary border-primary text-primary-foreground ring-4 ring-primary/15",
                  isUp && "bg-card border-border text-muted-foreground",
                  isWon && "bg-success/10 border-success text-success",
                  isBad && "bg-destructive/10 border-destructive text-destructive",
                )}>
                  <Icon className="size-3.5" strokeWidth={isDone ? 3 : 2} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      "text-[12px] font-semibold leading-tight truncate",
                      isUp && "text-muted-foreground",
                      isCurrent && "text-primary",
                      isWon && "text-success",
                      isBad && "text-destructive",
                    )}>
                      {s.label}
                    </span>
                    <ChevronDown className={cn(
                      "size-3 text-muted-foreground shrink-0 transition-transform",
                      isOpen && "rotate-180",
                    )} />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight truncate">
                    {s.sub} · {s.when}
                  </div>
                  {s.stage && (
                    <span className={cn(
                      "inline-block mt-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
                      isDone && "bg-success/10 text-success",
                      isCurrent && "bg-primary/10 text-primary",
                      isUp && "bg-muted text-muted-foreground",
                      isWon && "bg-success/15 text-success",
                      isBad && "bg-destructive/10 text-destructive",
                    )}>
                      {s.stage}
                    </span>
                  )}
                </div>
              </button>

              {/* Inline detail — aligned to the rail (ml-[42px]) */}
              {isOpen && (
                <div className="ml-[42px] mb-2 mr-0.5 rounded-md border border-border bg-surface/60 p-2.5 space-y-2">
                  <p className="text-[11px] text-foreground/80 leading-relaxed">
                    {s.detail}
                  </p>
                  {s.email && (
                    <div className="rounded-md border border-border bg-card p-2">
                      <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                        <Mail className="size-2.5" /> Email
                      </div>
                      <div className="text-[11px] font-semibold leading-tight">{s.email.subject}</div>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-snug line-clamp-3">
                        {s.email.preview}
                      </p>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="flex items-center gap-1 text-[9px] font-semibold text-primary">
                      <CheckCircle2 className="size-2.5" />
                      Current step · awaiting next trigger
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-dashed border-border">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          {branch === "reply"
            ? "Flow switches automatically if no reply within 3 days"
            : "Flow switches to Reply path the moment contact responds"}
        </span>
      </div>
    </div>
  );
}
