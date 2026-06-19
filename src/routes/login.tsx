import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const go = () => navigate({ to: "/app" });

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Ambient backdrop */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at 50% 30%, black 30%, transparent 75%)",
        }}
      />
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 size-[680px] rounded-full pointer-events-none blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, var(--color-primary), transparent 60%)" }}
      />

      {/* Top bar */}
      <header className="relative h-14 px-6 flex items-center gap-2">
        <div className="size-6 rounded-md bg-primary grid place-items-center">
          <div className="size-2.5 border-[1.5px] border-primary-foreground/70" />
        </div>
        <span className="text-[13px] font-bold tracking-tight">
          KEEHOO <span className="font-normal text-muted-foreground">CRM</span>
        </span>
        <span className="ml-auto text-[10px] font-mono uppercase text-muted-foreground inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-success" />
            All systems operational
          </span>
          <span className="hidden sm:inline">v2.4.1 · eu-west</span>
        </span>
      </header>

      {/* Center stage */}
      <main className="relative flex flex-col items-center justify-center px-6 py-10 min-h-[calc(100vh-7rem)]">
        <div className="w-full max-w-[420px]">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full border border-border bg-card text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <Sparkles className="size-3 text-primary" />
              AI-native CRM platform
            </div>
          </div>

          <div className="relative rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] p-7">
            <h1 className="text-[22px] font-semibold tracking-tight text-center">
              Sign in to your workspace
            </h1>
            <p className="text-[13px] text-muted-foreground text-center mt-1.5">
              Use your corporate credentials to continue.
            </p>

            <button
              type="button"
              onClick={go}
              className="mt-6 w-full h-10 rounded-md border border-border bg-card hover:border-primary/40 hover:bg-surface transition-colors text-[13px] font-medium inline-flex items-center justify-center gap-2.5"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
              <div className="flex-1 h-px bg-border" />
              or with email
              <div className="flex-1 h-px bg-border" />
            </div>

            <form className="space-y-3.5" onSubmit={(e) => { e.preventDefault(); go(); }}>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Work email
                </Label>
                <Input id="email" type="email" defaultValue="alex.sterling@keehoo.com" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Password
                  </Label>
                  <a className="text-[11px] text-primary hover:underline cursor-pointer">Forgot?</a>
                </div>
                <Input id="password" type="password" defaultValue="••••••••••••" className="h-10" />
              </div>

              <Button type="submit" className="w-full h-10 group">
                Sign in
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </form>

            <p className="mt-6 text-[11px] text-muted-foreground text-center">
              Self-registration is disabled. Ask your administrator for access.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-3 text-success" />SOC 2</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-3 text-success" />ISO 27001</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-3 text-success" />GDPR</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-3 text-success" />HIPAA</span>
          </div>
        </div>
      </main>

      <footer className="relative h-14 px-6 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>© Keehoo Industries · CRM platform</span>
        <span className="font-mono">Trusted by 1,200+ sales teams</span>
      </footer>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.75 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.95l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.29 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
