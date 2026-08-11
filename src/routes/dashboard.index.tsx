import { createFileRoute } from "@tanstack/react-router";

import { BuyerDashboard } from "@/components/dashboard/BuyerDashboard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Buyer dashboard — sellfy" },
      { name: "description", content: "Your Pi spending, orders, active services and courses in one place." },
      { property: "og:title", content: "Buyer dashboard — sellfy" },
      { property: "og:description", content: "Track everything you bought with Pi on sellfy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <DashboardShell>
      <BuyerDashboard />
    </DashboardShell>
  ),
});
