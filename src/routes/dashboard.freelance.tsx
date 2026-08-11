import { createFileRoute } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { FreelanceDashboard } from "@/components/dashboard/FreelanceDashboard";

export const Route = createFileRoute("/dashboard/freelance")({
  head: () => ({
    meta: [
      { title: "Freelance dashboard — sellfy" },
      { name: "description", content: "Gigs, active orders, escrow balance and buyer messages for sellfy freelancers." },
      { property: "og:title", content: "Freelance dashboard — sellfy" },
      { property: "og:description", content: "Manage your gigs and Pi escrow earnings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <DashboardShell>
      <FreelanceDashboard />
    </DashboardShell>
  ),
});
