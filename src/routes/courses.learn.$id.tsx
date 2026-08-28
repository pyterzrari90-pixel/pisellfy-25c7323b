import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { PiSignInGate } from "@/components/PiSignIn";
import { ReviewForm } from "@/components/Reviews";
import { useCourses } from "@/lib/courses/store";
import { courseLessons } from "@/lib/courses/types";
import { useStore } from "@/lib/marketplace/store";

export const Route = createFileRoute("/courses/learn/$id")({
  head: () => ({
    meta: [
      { title: "Course player — sellfy Courses" },
      { name: "description", content: "Watch lessons, download resources and track your completion progress." },
      { property: "og:title", content: "Course player — sellfy" },
      { property: "og:description", content: "Watch lessons and track progress." },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  return (
    <AppShell>
      <PiSignInGate>
        <Player />
      </PiSignInGate>
    </AppShell>
  );
}

function Player() {
  const { id } = useParams({ from: "/courses/learn/$id" });
  const { user } = useStore();
  const { courses, enrollments, isEnrolled, toggleLessonComplete, progress, addReview } = useCourses();
  const course = courses.find((c) => c.id === id);
  const [currentId, setCurrentId] = useState<string | null>(null);

  if (!course || !user) {
    return (
      <p className="text-sm text-muted-foreground">
        Course not found.{" "}
        <Link to="/courses" className="text-primary underline underline-offset-2">
          Browse courses
        </Link>
      </p>
    );
  }

  if (!isEnrolled(course.id, user.uid)) {
    return (
      <p className="text-sm text-muted-foreground">
        You're not enrolled in this course.{" "}
        <Link to="/courses/$id" params={{ id: course.id }} className="text-primary underline underline-offset-2">
          Enrol with Pi
        </Link>
      </p>
    );
  }

  const lessons = courseLessons(course);
  const enrollment = enrollments.find((e) => e.courseId === course.id && e.uid === user.uid);
  const done = enrollment?.completedLessonIds ?? [];
  const current = lessons.find((l) => l.id === currentId) ?? lessons[0]!;
  const pct = progress(course.id, user.uid, lessons.length);

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">{course.title}</h1>
      <div className="mt-2 h-2 w-full rounded-full bg-muted">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {done.length}/{lessons.length} lessons · {pct}% complete
      </p>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <video
            key={current.id}
            src={current.videoUrl}
            controls
            className="w-full rounded-xl border border-border bg-black"
          />
          <h2 className="mt-3 text-lg font-semibold">{current.title}</h2>
          {current.resources.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm">
              {current.resources.map((resource) => (
                <li key={resource.url}>
                  <a href={resource.url} className="text-primary underline underline-offset-2" download>
                    ⬇ {resource.name}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={() => toggleLessonComplete(course.id, user.uid, current.id)}
            className="mt-3 rounded-lg border border-input px-4 py-2 text-sm"
          >
            {done.includes(current.id) ? "Mark as not watched" : "Mark as watched"}
          </button>

          <div className="mt-6">
            <ReviewForm
              label="Rate this course"
              onSubmit={(rating, comment) =>
                addReview({
                  targetId: course.id,
                  authorUid: user.uid,
                  authorName: user.username,
                  rating,
                  comment,
                })
              }
            />
          </div>
        </div>

        <aside className="space-y-3">
          {course.sections.map((section) => (
            <div key={section.id} className="rounded-xl border border-border bg-card">
              <p className="border-b border-border px-3 py-2 text-sm font-medium">{section.title}</p>
              <ul className="divide-y divide-border">
                {section.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <button
                      onClick={() => setCurrentId(lesson.id)}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent ${
                        lesson.id === current.id ? "bg-accent font-medium" : ""
                      }`}
                    >
                      <span className="min-w-0 truncate">
                        {done.includes(lesson.id) ? "✓ " : "○ "}
                        {lesson.title}
                      </span>
                      <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                        {lesson.durationMin}m
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
