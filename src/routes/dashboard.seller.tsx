import { createFileRoute } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SellerDashboard } from "@/components/dashboard/SellerDashboard";

export const Route = createFileRoute("/dashboard/seller")({
  head: () => ({
    meta: [
      { title: "Seller dashboard — sellfy" },
      { name: "description", content: "Marketplace listings, orders received and Pi balance for sellfy sellers." },
      { property: "og:title", content: "Seller dashboard — sellfy" },
      { property: "og:description", content: "Track your products, sales and Pi earnings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <DashboardShell>
      <SellerDashboard />
    </DashboardShell>
  ),
});
