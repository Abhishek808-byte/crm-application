import { createFileRoute, useLocation } from "@tanstack/react-router";
import { PageHeader } from "@/components/shell/PageHeader";
import { Construction } from "lucide-react";
import { MODULES } from "@/lib/erp-config";

export const Route = createFileRoute("/app/$")({
  component: AppFallbackPage,
});

function AppFallbackPage() {
  const location = useLocation();
  const segs = location.pathname.split("/").filter(Boolean); // ["app", module, sub?]
  const moduleId = segs[1];
  const subSeg = segs[2];

  const mod = MODULES.find((m) => m.id === moduleId);
  const sub = mod?.submodules.find((s) => s.path === location.pathname);

  const title = sub?.label ?? mod?.name ?? "Workspace";
  const description =
    sub?.description ?? mod?.description ?? "This page is coming soon.";

  return (
    <>
      <PageHeader
        eyebrow={mod?.name ?? "Keehoo"}
        title={title}
        description={description}
      />
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-8 py-16">
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <div className="mx-auto size-12 rounded-full bg-secondary grid place-items-center text-secondary-foreground">
              <Construction className="size-5" />
            </div>
            <h2 className="mt-5 text-[18px] font-semibold tracking-tight">
              {title} is coming soon
            </h2>
            <p className="mt-2 text-[13px] text-muted-foreground">
              {description}.
            </p>
            <p className="mt-6 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              {location.pathname}{subSeg ? "" : ""}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
