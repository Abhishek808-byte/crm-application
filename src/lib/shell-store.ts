import { create } from "zustand";
import type { ApprovalItem } from "./erp-data";

interface ShellState {
  appLauncherOpen: boolean;
  commandPaletteOpen: boolean;
  notificationsOpen: boolean;
  drawerItem: ApprovalItem | null;
  setAppLauncher: (v: boolean) => void;
  setCommandPalette: (v: boolean) => void;
  setNotifications: (v: boolean) => void;
  openDrawer: (i: ApprovalItem) => void;
  closeDrawer: () => void;
}

export const useShell = create<ShellState>((set) => ({
  appLauncherOpen: false,
  commandPaletteOpen: false,
  notificationsOpen: false,
  drawerItem: null,
  setAppLauncher: (v) => set({ appLauncherOpen: v }),
  setCommandPalette: (v) => set({ commandPaletteOpen: v }),
  setNotifications: (v) => set({ notificationsOpen: v }),
  openDrawer: (i) => set({ drawerItem: i }),
  closeDrawer: () => set({ drawerItem: null }),
}));
