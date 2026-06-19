import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Shield, KeyRound, LogOut } from "lucide-react";

export const Route = createFileRoute("/app/profile")({
  component: Profile,
});

function Profile() {
  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile & Security"
        description="Your identity, sessions, and notification preferences"
        actions={<Button variant="outline" size="sm"><LogOut className="size-3.5" /> Sign out everywhere</Button>}
      />
      <div className="flex-1 overflow-auto scrollbar-thin p-6">
        <div className="max-w-3xl space-y-6">
          <section className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-full bg-surface-2 border border-border grid place-items-center text-base font-mono font-semibold">AS</div>
              <div>
                <div className="text-base font-semibold">Alex Sterling</div>
                <div className="text-xs text-muted-foreground">alex.sterling@keehoo.com · Sales Manager · Admin</div>
              </div>
            </div>
            <Separator className="my-5" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Display name</Label>
                <Input defaultValue="Alex Sterling" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Job title</Label>
                <Input defaultValue="Sales Manager" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Timezone</Label>
                <Input defaultValue="Europe/Stockholm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Locale</Label>
                <Input defaultValue="en-GB" />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">Security</h2>
            </div>
            <div className="space-y-4">
              <ToggleRow label="Two-factor authentication" desc="Authenticator app · enrolled" defaultChecked />
              <ToggleRow label="Hardware security key" desc="YubiKey 5C · enrolled" defaultChecked />
              <ToggleRow label="SSO enforced" desc="Login restricted to corporate SSO" defaultChecked />
              <ToggleRow label="Session 14-day auto sign-out" />
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">API tokens</h2>
            </div>
            <div className="text-xs text-muted-foreground">No tokens issued. Create one to integrate Keehoo with external systems.</div>
            <Button variant="outline" size="sm" className="mt-3">Generate token</Button>
          </section>
        </div>
      </div>
    </>
  );
}

function ToggleRow({ label, desc, defaultChecked }: { label: string; desc?: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {desc && <div className="text-[11px] text-muted-foreground mt-0.5">{desc}</div>}
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
