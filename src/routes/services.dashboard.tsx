import { createFileRoute } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { FreelanceDashboard } from "@/components/dashboard/FreelanceDashboard";

export const Route = createFileRoute("/services/dashboard")({
  head: () => ({
    meta: [
      { title: "Freelancer hub — sellfy" },
      { name: "description", content: "Track your gigs, active orders, Pi earnings and buyer messages." },
      { property: "og:title", content: "Freelancer hub — sellfy" },
      { property: "og:description", content: "Orders, earnings and messages for sellfy freelancers." },
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
