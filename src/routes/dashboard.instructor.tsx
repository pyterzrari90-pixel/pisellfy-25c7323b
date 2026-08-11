import { createFileRoute } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { InstructorDashboard } from "@/components/dashboard/InstructorDashboard";

export const Route = createFileRoute("/dashboard/instructor")({
  head: () => ({
    meta: [
      { title: "Instructor dashboard — sellfy" },
      { name: "description", content: "Courses created, students enrolled and Pi revenue per course." },
      { property: "og:title", content: "Instructor dashboard — sellfy" },
      { property: "og:description", content: "Students, revenue and reviews at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <DashboardShell>
      <InstructorDashboard />
    </DashboardShell>
  ),
});
