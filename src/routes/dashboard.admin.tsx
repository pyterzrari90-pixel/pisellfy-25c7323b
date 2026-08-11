import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { EmptyState } from "@/components/dashboard/kit";
import { isAdmin } from "@/lib/admin";
import { useStore } from "@/lib/marketplace/store";

export const Route = createFileRoute("/dashboard/admin")({
  head: () => ({
    meta: [
      { title: "Platform dashboard — sellfy admin" },
      { name: "description", content: "Restricted admin view: platform revenue, commissions and global activity." },
      { property: "og:title", content: "Platform dashboard — sellfy" },
      { property: "og:description", content: "Consolidated overview of the sellfy platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminRoute,
});

function AdminRoute() {
  return (
    <DashboardShell>
      <AdminGate />
    </DashboardShell>
  );
}

function AdminGate() {
  const { user } = useStore();
  if (!isAdmin(user)) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Restricted area"
        description="The platform dashboard is reserved for sellfy administrators."
        actionLabel="Back to my dashboard"
        to="/dashboard"
      />
    );
  }
  return <AdminDashboard />;
}
