import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useShell } from "@/lib/shell-store";
import { RECENT_ACTIVITY } from "@/lib/erp-data";
import { CheckCircle2, MessageSquare, AlertTriangle, Sparkles } from "lucide-react";

const ICONS = {
  approve: { icon: CheckCircle2, tone: "text-success bg-success/10" },
  comment: { icon: MessageSquare, tone: "text-info bg-info/10" },
  flag: { icon: AlertTriangle, tone: "text-warning bg-warning/10" },
  ai: { icon: Sparkles, tone: "text-primary bg-primary/10" },
};

export function NotificationsPanel() {
  const { notificationsOpen, setNotifications } = useShell();
  return (
    <Sheet open={notificationsOpen} onOpenChange={setNotifications}>
      <SheetContent side="right" className="w-full sm:max-w-sm p-0 gap-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border">
          <SheetTitle className="text-sm">Notifications</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-border">
          {RECENT_ACTIVITY.concat(RECENT_ACTIVITY).map((a, i) => {
            const meta = ICONS[a.type];
            const Icon = meta.icon;
            return (
              <div key={`${a.id}-${i}`} className="px-5 py-3 flex gap-3 hover:bg-surface transition-colors">
                <div className={`size-7 rounded-md grid place-items-center shrink-0 ${meta.tone}`}>
                  <Icon className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs leading-snug">
                    <strong>{a.actor}</strong>{" "}
                    <span className="text-muted-foreground">{a.action}</span>{" "}
                    <span>{a.target}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{a.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
