import { useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Bell, Sparkles, LogOut, User } from "lucide-react";
import { useShell } from "@/lib/shell-store";
import { APP_LAUNCHER_ICON } from "@/lib/erp-config";
import { AppearanceMenu } from "@/components/AppearanceMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Topbar() {
  const {
    setAppLauncher, setCommandPalette, setNotifications,
  } = useShell();
  const navigate = useNavigate();
  const Launcher = APP_LAUNCHER_ICON;

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPalette(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setAppLauncher(true);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommandPalette, setAppLauncher]);

  return (
    <header className="h-12 shrink-0 border-b border-border bg-card flex items-center px-3 gap-3 z-40">
      <Link to="/app/crm/contacts" className="flex items-center gap-2 w-56 shrink-0 group">
        <div className="size-6 rounded-md bg-primary grid place-items-center">
          <div className="size-2.5 border-[1.5px] border-primary-foreground/70" />
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-bold tracking-tight">
            KEEHOO <span className="font-normal text-muted-foreground">CRM</span>
          </div>
        </div>
      </Link>

      <button
        onClick={() => setAppLauncher(true)}
        className="size-8 rounded-md grid place-items-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        title="App launcher (⌘J)"
        aria-label="Open app launcher"
      >
        <Launcher className="size-4" />
      </button>

      <div className="flex-1 flex justify-center">
        <button
          onClick={() => setCommandPalette(true)}
          className="group w-full max-w-xl h-8 flex items-center gap-2.5 px-3 rounded-md border border-border bg-surface hover:bg-card hover:border-ring/40 transition-colors text-left"
        >
          <Search className="size-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground flex-1">
            Search contacts, deals, tasks, or ask AI…
          </span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-card text-muted-foreground">
            ⌘ K
          </kbd>
        </button>
      </div>

      <div className="w-56 shrink-0 flex items-center justify-end gap-1">
        <span className="hidden lg:inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2">
          <Sparkles className="size-3 text-primary" />
          AI assist
          <span className="size-1.5 rounded-full bg-success" />
        </span>
        <AppearanceMenu />
        <button
          onClick={() => setNotifications(true)}
          className="relative size-8 rounded-md grid place-items-center text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-destructive" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="ml-1 size-7 rounded-full bg-surface-2 border border-border grid place-items-center text-[10px] font-mono font-semibold hover:border-ring/40"
              title="Account"
            >
              AS
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span className="text-[13px]">Alex Sterling</span>
              <span className="text-[11px] font-normal text-muted-foreground">alex.sterling@keehoo.com</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/app/profile" })}>
              <User className="size-3.5 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate({ to: "/login" })}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="size-3.5 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
