import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Zap, Play, RefreshCw, Check, Sparkles, Shield, FileEdit,
  UserCheck, Send, ShoppingBag,
} from "lucide-react";

type StepState = "done" | "current" | "pending";

interface Step {
  id: string;
  label: string;
  icon: typeof Check;
  state: StepState;
  tail?: string; // small caption under (Done / Pending / Switch →)
  variant?: "sales"; // dashed accent
}

const STEPS: Step[] = [
  { id: "created",  label: "Contact Created",         icon: Check,      state: "done",    tail: "✓ Done" },
  { id: "icp",      label: "ICP Score Generated",     icon: Sparkles,   state: "pending", tail: "Pending" },
  { id: "review",   label: "ICP Review",              icon: Shield,     state: "pending", tail: "Pending" },
  { id: "drafted",  label: "Email Drafted",           icon: FileEdit,   state: "pending", tail: "Pending" },
  { id: "approval", label: "Human Approval for Email",icon: UserCheck,  state: "pending", tail: "Pending" },
  { id: "sent",     label: "Email Sent",              icon: Send,       state: "pending", tail: "Pending" },
  { id: "sales",    label: "Sales",                   icon: ShoppingBag,state: "pending", tail: "Switch →", variant: "sales" },
];

export function LeadflowStrip() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between gap-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-primary fill-primary/20" />
          <h3 className="text-sm font-semibold">Leadflow</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-7 text-xs gap-1.5">
            <Play className="size-3 fill-current" /> Run Pipeline
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
            <RefreshCw className="size-3" /> Refresh
          </Button>
        </div>
      </div>

      {/* Steps */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-start gap-1 overflow-x-auto scrollbar-thin">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = activeId === s.id;
            const isDone = s.state === "done";
            const isSales = s.variant === "sales";
            return (
              <div key={s.id} className="flex items-start flex-1 min-w-[92px]">
                <button
                  onClick={() => setActiveId(isActive ? null : s.id)}
                  className="flex flex-col items-center flex-1 group"
                >
                  <div className={cn(
                    "size-11 rounded-full grid place-items-center border-2 transition-all",
                    isDone && "bg-success border-success text-white",
                    !isDone && !isSales && "bg-muted/60 border-transparent text-muted-foreground group-hover:bg-muted",
                    isSales && "bg-primary/5 border-primary border-dashed text-primary",
                    isActive && "ring-4 ring-primary/20",
                  )}>
                    <Icon className="size-4" strokeWidth={isDone ? 3 : 2} />
                  </div>
                  <div className={cn(
                    "text-[11px] font-semibold text-center mt-2 leading-tight px-1 max-w-[90px]",
                    isActive ? "text-primary" : "text-foreground",
                  )}>
                    {s.label}
                  </div>
                  <div className={cn(
                    "text-[10px] mt-0.5 leading-tight",
                    isDone ? "text-success font-medium"
                    : isSales ? "text-primary font-medium"
                    : "text-muted-foreground",
                  )}>
                    {s.tail}
                  </div>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    "h-px flex-1 mt-[22px] shrink-0",
                    isDone ? "bg-success/60" : "border-t border-dashed border-border",
                  )} style={isDone ? undefined : { background: "transparent" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Info panel */}
        {activeId ? (
          <StepInfo step={STEPS.find(s => s.id === activeId)!} />
        ) : (
          <div className="text-center text-[11px] text-muted-foreground py-3">
            Click a step to view its activity
          </div>
        )}
      </div>
    </div>
  );
}

const STEP_INFO: Record<string, { title: string; body: string; meta: string }> = {
  created:  { title: "Contact Created",          meta: "6 days ago · via Cold Outreach",  body: "Contact was imported into the CRM from your Cold Outreach source batch." },
  icp:      { title: "ICP Score Generation",     meta: "Waiting to run",                   body: "AI Kruise will score how well this contact fits your Ideal Customer Profile using role, industry, and firmographic signals." },
  review:   { title: "ICP Review",               meta: "Awaiting your approval",          body: "You review the AI score and decide whether to release this contact into the outreach pipeline." },
  drafted:  { title: "Discovery Email Drafted",  meta: "Not started",                     body: "AI Kruise will draft a personalized opener using the Discovery v2 template once the ICP is approved." },
  approval: { title: "Human Approval for Email", meta: "Not started",                     body: "You review the drafted email, tweak tone if needed, and approve for send." },
  sent:     { title: "Discovery Email Sent",     meta: "Not started",                     body: "Once approved, the email is dispatched and tracked for opens, clicks, and replies." },
  sales:    { title: "Handover to Sales",        meta: "Manual switch",                   body: "Move a qualified, engaged contact into the Sales pipeline for deal management, demos, and closing." },
};

function StepInfo({ step }: { step: Step }) {
  const info = STEP_INFO[step.id];
  const Icon = step.icon;
  return (
    <div className="mt-3 rounded-md border border-border bg-surface/50 p-3 flex gap-3">
      <div className={cn(
        "size-8 rounded-full grid place-items-center shrink-0",
        step.state === "done" ? "bg-success text-white" : "bg-primary/10 text-primary",
      )}>
        <Icon className="size-4" strokeWidth={step.state === "done" ? 3 : 2} />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-semibold">{info.title}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{info.meta}</div>
        <p className="text-[11px] text-foreground/80 mt-1.5 leading-relaxed">{info.body}</p>
      </div>
    </div>
  );
}
