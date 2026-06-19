import { Outlet } from "@tanstack/react-router";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";
import { StatusStrip } from "./StatusStrip";
import { AppLauncher } from "./AppLauncher";
import { CommandPalette } from "./CommandPalette";
import { ApprovalDrawer } from "./ApprovalDrawer";
import { NotificationsPanel } from "./NotificationsPanel";

import { Toaster } from "@/components/ui/sonner";

export function ShellLayout() {
  return (
    <div className="fixed inset-0 flex flex-col bg-background text-foreground overflow-hidden">
      <Topbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden bg-background">
          <Outlet />
        </main>
      </div>
      <StatusStrip />

      <AppLauncher />
      <CommandPalette />
      <ApprovalDrawer />
      <NotificationsPanel />
      
      <Toaster position="bottom-right" />
    </div>
  );
}
