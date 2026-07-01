import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Activity, UserPlus, Mail, MailPlus, Reply, Calendar, ChevronDown,
} from "lucide-react";

type ActState = "done" | "current" | "upcoming";

interface ActStep {
  id: string;
  label: string;
  sub: string;
  when: string;
  state: ActState;
  icon: typeof UserPlus;
  detail: string;
  email?: { subject: string; preview: string };
}

const STEPS: ActStep[] = [
  {
    id: "added", label: "Contact Added", sub: "via Cold Outreach",
    when: "6d ago", state: "done", icon: UserPlus,
    detail: "Imported into the CRM from the Cold Outreach batch on Mar 14. Enriched with LinkedIn + Clearbit signals.",
  },
  {
    id: "discovery", label: "Discovery Email", sub: "Initial outreach",
    when: "5d ago", state: "current", icon: Mail,
    detail: "Personalized opener drafted by AI Kruise using the Discovery v2 template. Delivered — 2 opens, no reply yet.",
    email: {
      subject: "Quick question about your outbound stack",
      preview: "Hi Shradha — noticed your team recently expanded. We help teams like yours cut manual outreach time by 60%…",
    },
  },
  {
    id: "f1", label: "Follow-up #1", sub: "3–5 days later",
    when: "in 2d", state: "upcoming", icon: MailPlus,
    detail: "Different angle — highlight a peer case study and share a one-line value hook.",
    email: {
      subject: "One more thought",
      preview: "Wanted to share how a similar team saved 12 hrs/week on outbound research…",
    },
  },
  {
    id: "f2", label: "Follow-up #2", sub: "7–10 days later",
    when: "in 7d", state: "upcoming", icon: MailPlus,
    detail: "Social proof + breakup tone. Last touch before the contact moves to the 90-day nurture campaign.",
  },
  {
    id: "reply", label: "Reply Received", sub: "Contact responded",
    when: "—", state: "upcoming", icon: Reply,
    detail: "Fires automatically when the contact replies. Positive intent routes to a meeting scheduler.",
  },
  {
    id: "meeting", label: "Meeting Booked", sub: "Discovery call set",
    when: "—", state: "upcoming", icon: Calendar,
    detail: "Calendar invite + agenda sent. Contact enters the Sales pipeline once the meeting is confirmed.",
  },
];

export function ActivityRail() {
  const [openId, setOpenId] = useState<string | null>("discovery");

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Activity className="size-3.5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Activity</span>
        </div>
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
          Live
        </span>
      </div>

      {/* Scrollable rail */}
      <div className="max-h-[420px] overflow-y-auto scrollbar-thin pr-1 -mr-1">
        {STEPS.map((s, i) => {
          const isOpen = openId === s.id;
          const isDone = s.state === "done";
          const isCurrent = s.state === "current";
          const isUp = s.state === "upcoming";
          const Icon = s.icon;
          const last = i === STEPS.length - 1;

          return (
            <div key={s.id} className="relative">
              {/* Rail line */}
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
                  "relative w-full text-left flex items-start gap-2.5 py-2 pr-2 pl-0 rounded-md transition-colors",
                  "hover:bg-muted/40",
                  isOpen && "bg-accent",
                )}
              >
                <div className={cn(
                  "size-8 rounded-full grid place-items-center border-2 shrink-0 z-10 relative",
                  isDone && "bg-success border-success text-white",
                  isCurrent && "bg-primary border-primary text-primary-foreground ring-4 ring-primary/15",
                  isUp && "bg-card border-border text-muted-foreground",
                )}>
                  <Icon className="size-3.5" strokeWidth={isDone ? 3 : 2} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      "text-[12px] font-semibold leading-tight",
                      isUp && "text-muted-foreground",
                      isCurrent && "text-primary",
                    )}>
                      {s.label}
                    </span>
                    <ChevronDown className={cn(
                      "size-3 text-muted-foreground shrink-0 transition-transform",
                      isOpen && "rotate-180",
                    )} />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                    {s.sub} · {s.when}
                  </div>
                </div>
              </button>

              {/* Inline detail */}
              {isOpen && (
                <div className="ml-[42px] mb-2 mr-1 rounded-md border border-border bg-card p-2.5 space-y-2">
                  <p className="text-[11px] text-foreground/80 leading-relaxed">
                    {s.detail}
                  </p>
                  {s.email && (
                    <div className="rounded-md border border-border bg-surface/50 p-2">
                      <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                        <Mail className="size-2.5" /> Email
                      </div>
                      <div className="text-[11px] font-semibold leading-tight">{s.email.subject}</div>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-snug line-clamp-3">
                        {s.email.preview}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-2 pt-2 border-t border-dashed border-border">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          Coming soon · custom sequences
        </span>
      </div>
    </div>
  );
}
