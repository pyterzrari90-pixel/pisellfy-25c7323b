import { createFileRoute } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { InstructorDashboard } from "@/components/dashboard/InstructorDashboard";

export const Route = createFileRoute("/courses/dashboard")({
  head: () => ({
    meta: [
      { title: "Instructor hub — sellfy Courses" },
      { name: "description", content: "Enrolments, Pi revenue and reviews for the courses you teach on sellfy." },
      { property: "og:title", content: "Instructor hub — sellfy" },
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
