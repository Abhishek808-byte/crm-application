import { useShell } from "@/lib/shell-store";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator, CommandShortcut,
} from "@/components/ui/command";
import {
  Sparkles, Contact, Target, ListChecks, GitMerge,
  Building2, Megaphone, CalendarDays, BarChart3, Plus,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPalette } = useShell();
  const navigate = useNavigate();

  function run(path: string) {
    setCommandPalette(false);
    navigate({ to: path });
  }

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPalette}>
      <CommandInput placeholder="Search contacts, deals, tasks, or ask AI…" />
      <CommandList className="max-h-[480px]">
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="AI actions">
          <CommandItem onSelect={() => run("/app/crm/contacts")}>
            <Sparkles className="text-primary" />
            <span>Summarize high-intent leads in pipeline</span>
            <CommandShortcut>AI</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run("/app/crm/pipeline")}>
            <Sparkles className="text-primary" />
            <span>Identify stalled deals this quarter</span>
            <CommandShortcut>AI</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => run("/app/crm/contacts")}>
            <Contact /><span>Contacts</span><CommandShortcut>G C</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run("/app/crm/pipeline")}>
            <GitMerge /><span>Pipeline</span><CommandShortcut>G P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run("/app/crm/deals")}>
            <Target /><span>Deals</span><CommandShortcut>G D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run("/app/crm/tasks")}>
            <ListChecks /><span>Tasks</span><CommandShortcut>G T</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run("/app/crm/accounts")}>
            <Building2 /><span>Accounts</span>
          </CommandItem>
          <CommandItem onSelect={() => run("/app/marketing")}>
            <Megaphone /><span>Marketing Campaigns</span>
          </CommandItem>
          <CommandItem onSelect={() => run("/app/calendar")}>
            <CalendarDays /><span>Calendar</span>
          </CommandItem>
          <CommandItem onSelect={() => run("/app/analytics")}>
            <BarChart3 /><span>Analytics</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Create">
          <CommandItem onSelect={() => run("/app/crm/contacts")}>
            <Plus /><span>New contact</span><CommandShortcut>N C</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run("/app/crm/deals")}>
            <Plus /><span>New deal</span><CommandShortcut>N D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run("/app/crm/tasks")}>
            <Plus /><span>New task</span><CommandShortcut>N T</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run("/app/marketing")}>
            <Plus /><span>New campaign</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
