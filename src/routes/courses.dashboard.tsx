import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { AppShell } from "@/components/AppShell";
import { PiSignInGate } from "@/components/PiSignIn";
import { Stars } from "@/components/Stars";
import { useCourses } from "@/lib/courses/store";
import { averageRating } from "@/lib/freelance/types";
import { useStore } from "@/lib/marketplace/store";

export const Route = createFileRoute("/courses/dashboard")({
  head: () => ({
    meta: [
      { title: "Instructor dashboard — sellfy Courses" },
      { name: "description", content: "Enrolments, Pi revenue and reviews for the courses you teach on sellfy." },
      { property: "og:title", content: "Instructor dashboard — sellfy" },
      { property: "og:description", content: "Students, revenue and reviews at a glance." },
    ],
  }),
  component: InstructorDashboardPage,
});

function InstructorDashboardPage() {
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">Instructor dashboard</h1>
      <div className="mt-4">
        <PiSignInGate>
          <Dashboard />
        </PiSignInGate>
      </div>
    </AppShell>
  );
}

function Dashboard() {
  const { user } = useStore();
  const { courses, enrollments, reviews, getInstructor } = useCourses();

  const myCourses = useMemo(
    () => courses.filter((c) => c.instructorUid === user?.uid),
    [courses, user],
  );
  const myEnrollments = enrollments.filter((e) => myCourses.some((c) => c.id === e.courseId));
  const revenue = myEnrollments.reduce((sum, e) => sum + e.price, 0);
  const myReviews = reviews.filter((r) => myCourses.some((c) => c.id === r.targetId));
  const profile = user ? getInstructor(user.uid) : undefined;

  return (
    <div className="space-y-6">
      {!profile && (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          No instructor profile yet.{" "}
          <Link to="/courses/become" className="text-primary underline underline-offset-2">
            Create one
          </Link>
          .
        </p>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Students" value={String(myEnrollments.length)} />
        <Stat label="Revenue" value={`${revenue.toFixed(2)} π`} />
        <Stat label="Rating" value={<Stars rating={averageRating(myReviews)} count={myReviews.length} />} />
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My courses</h2>
          <Link to="/courses/new" className="text-sm text-primary underline underline-offset-2">
            + New course
          </Link>
        </div>
        {myCourses.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">You haven't published a course yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {myCourses.map((course) => {
              const students = enrollments.filter((e) => e.courseId === course.id).length;
              const rating = averageRating(reviews.filter((r) => r.targetId === course.id));
              return (
                <li key={course.id} className="rounded-xl border border-border bg-card p-3">
                  <Link to="/courses/$id" params={{ id: course.id }} className="text-sm font-medium hover:text-primary">
                    {course.title}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {students} student{students === 1 ? "" : "s"} · {course.price} π ·{" "}
                    <Stars rating={rating} />
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Latest reviews</h2>
        {myReviews.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {myReviews.slice(0, 8).map((review) => (
              <li key={review.id} className="rounded-xl border border-border bg-card p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">@{review.authorName}</span>
                  <Stars rating={review.rating} />
                </div>
                <p className="mt-1 text-muted-foreground">{review.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  );
}
