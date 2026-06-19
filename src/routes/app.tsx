import { createFileRoute, redirect } from "@tanstack/react-router";
import { ShellLayout } from "@/components/shell/ShellLayout";

export const Route = createFileRoute("/app")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/app" || location.pathname === "/app/") {
      throw redirect({ to: "/app/crm/contacts" });
    }
  },
  component: ShellLayout,
});
