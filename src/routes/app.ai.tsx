import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ArrowUp } from "lucide-react";

export const Route = createFileRoute("/app/ai")({
  component: AIAssistant,
});

function AIAssistant() {
  return (
    <>
      <PageHeader
        eyebrow="CRM · AI"
        title="AI Assistant"
        description="CRM-aware copilot for contacts, pipeline, deals and outreach"
      />
      <div className="flex-1 overflow-hidden flex flex-col items-center bg-surface/40">
        <div className="w-full max-w-3xl flex-1 overflow-y-auto scrollbar-thin px-6 py-8 space-y-6">
          <Message role="user">
            Summarise high-intent leads stalled in the pipeline this week.
          </Message>
          <Message role="ai">
            <p>There are <strong>3 contacts</strong> with intent score "High" that haven't moved stages in 7+ days:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><span className="font-mono text-primary">C-003</span> — Sofia Reyes, Verdant Pharma · stuck in <strong>Outreach</strong> for 9 days · ICP 82</li>
              <li><span className="font-mono text-primary">C-007</span> — Carlos Vega, Atlas Biotech · stuck in <strong>Demo</strong> for 11 days · ICP 74</li>
              <li><span className="font-mono text-primary">C-011</span> — Ben Howard, Apex Fintech · stuck in <strong>Response</strong> for 8 days · ICP 68</li>
            </ul>
            <p className="mt-2">I can draft a re-engagement sequence or move them to the next stage. What would you like?</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs">Draft sequence</Button>
              <Button size="sm" className="h-7 text-xs">Advance stage</Button>
            </div>
          </Message>

          <Message role="user">
            Which source is giving us the best qualified leads?
          </Message>
          <Message role="ai">
            <p>Based on qualification rate across all batches:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Domain enrich</strong> — 85% qual rate · 180 total leads</li>
              <li><strong>LinkedIn</strong> — 68% qual rate · 120 total leads</li>
              <li><strong>visitor.iq</strong> — 65% qual rate · 240 total leads (highest volume)</li>
              <li><strong>MongoDB</strong> — 42% qual rate · 90 total leads</li>
            </ul>
            <p className="mt-2">Domain enrich delivers the highest quality. Consider reallocating budget from MongoDB imports. See <strong>Analytics → Sources</strong> for the full breakdown.</p>
          </Message>
        </div>
        <div className="w-full max-w-3xl px-6 pb-6">
          <div className="rounded-xl border border-border bg-card shadow-sm p-3 flex items-end gap-2">
            <Textarea
              placeholder="Ask anything about your contacts, pipeline, or deals…"
              className="min-h-[44px] max-h-32 resize-none border-none focus-visible:ring-0 text-sm"
            />
            <Button size="sm" className="h-8"><ArrowUp className="size-3.5" /></Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[
              "What deals are at risk this week?",
              "Show top ICP contacts without a task",
              "Summarise pipeline by stage",
            ].map(s => (
              <button key={s} className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-card hover:bg-surface text-muted-foreground transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Message({ role, children }: { role: "user" | "ai"; children: React.ReactNode }) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <div className="size-7 rounded-md bg-primary/10 text-primary grid place-items-center shrink-0">
        <Sparkles className="size-4" />
      </div>
      <div className="flex-1 rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}
