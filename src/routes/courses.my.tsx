import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { PiSignInGate } from "@/components/PiSignIn";
import { useCourses } from "@/lib/courses/store";
import { courseLessons } from "@/lib/courses/types";
import { useStore } from "@/lib/marketplace/store";

export const Route = createFileRoute("/courses/my")({
  head: () => ({
    meta: [
      { title: "My learning — sellfy Courses" },
      { name: "description", content: "All the courses you bought with Pi, with your completion progress." },
      { property: "og:title", content: "My learning — sellfy" },
      { property: "og:description", content: "Your enrolled courses and progress." },
    ],
  }),
  component: MyLearningPage,
});

function MyLearningPage() {
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">My learning</h1>
      <div className="mt-4">
        <PiSignInGate>
          <MyCourses />
        </PiSignInGate>
      </div>
    </AppShell>
  );
}

function MyCourses() {
  const { user } = useStore();
  const { courses, enrollments, progress } = useCourses();
  const mine = enrollments.filter((e) => e.uid === user?.uid);

  if (mine.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        You haven't enrolled in a course yet.{" "}
        <Link to="/courses" className="text-primary underline underline-offset-2">
          Browse courses
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {mine.map((enrollment) => {
        const course = courses.find((c) => c.id === enrollment.courseId);
        if (!course || !user) return null;
        const pct = progress(course.id, user.uid, courseLessons(course).length);
        return (
          <li key={enrollment.id} className="overflow-hidden rounded-xl border border-border bg-card">
            <img src={course.cover} alt={course.title} className="aspect-video w-full object-cover" />
            <div className="p-3">
              <h2 className="line-clamp-2 text-sm font-medium">{course.title}</h2>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{pct}% complete</p>
              <Link
                to="/courses/learn/$id"
                params={{ id: course.id }}
                className="mt-3 block rounded-lg bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                {pct > 0 ? "Continue" : "Start"} course
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
