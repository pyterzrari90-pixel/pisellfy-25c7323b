import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { PiSignInCard } from "@/components/PiSignIn";
import { ReviewList } from "@/components/Reviews";
import { useCourses } from "@/lib/courses/store";
import { courseDuration, courseLessons } from "@/lib/courses/types";
import { useStore } from "@/lib/marketplace/store";
import { usePiPayment } from "@/lib/pi/use-pi-payment";

export const Route = createFileRoute("/courses/$id")({
  head: () => ({
    meta: [
      { title: "Course details — sellfy Courses" },
      { name: "description", content: "Full curriculum, free preview lesson and reviews. Enrol and pay in Pi." },
      { property: "og:title", content: "Course details — sellfy Courses" },
      { property: "og:description", content: "Enrol in this course and pay in Pi." },
    ],
  }),
  component: CourseDetail,
});

function CourseDetail() {
  const { id } = useParams({ from: "/courses/$id" });
  const { user, hydrated } = useStore();
  const { courses, reviews, enroll, isEnrolled } = useCourses();
  const { status, pay } = usePiPayment();
  const [showPreview, setShowPreview] = useState(false);

  const course = courses.find((c) => c.id === id);
  const courseReviews = useMemo(() => reviews.filter((r) => r.targetId === id), [reviews, id]);

  if (!course) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">
          This course doesn't exist.{" "}
          <Link to="/courses" className="text-primary underline underline-offset-2">
            Browse courses
          </Link>
        </p>
      </AppShell>
    );
  }

  const lessons = courseLessons(course);
  const preview = lessons.find((l) => l.preview);
  const enrolled = user ? isEnrolled(course.id, user.uid) : false;

  function buy() {
    if (!user || !course) return;
    void pay(
      {
        amount: course.price,
        memo: `sellfy course: ${course.title.slice(0, 45)}`,
        metadata: { kind: "course", courseId: course.id, uid: user.uid },
      },
      ({ paymentId, txid }) => {
        enroll({
          courseId: course.id,
          uid: user.uid,
          username: user.username,
          paymentId,
          txid,
          price: course.price,
        });
      },
      `Enrolled! Paid ${course.price} Pi.`,
    );
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">{course.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {course.category} · {course.level} · {lessons.length} lessons · {courseDuration(course)} min ·
        by @{course.instructorName}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <img
            src={course.cover}
            alt={course.title}
            className="aspect-video w-full rounded-xl border border-border object-cover"
          />
          <p className="text-sm leading-relaxed text-muted-foreground">{course.description}</p>

          <section>
            <h2 className="text-lg font-semibold">Curriculum</h2>
            <div className="mt-3 space-y-3">
              {course.sections.map((section) => (
                <div key={section.id} className="rounded-xl border border-border bg-card">
                  <p className="border-b border-border px-3 py-2 text-sm font-medium">{section.title}</p>
                  <ul className="divide-y divide-border">
                    {section.lessons.map((lesson) => (
                      <li key={lesson.id} className="flex items-center justify-between px-3 py-2 text-sm">
                        <span className="min-w-0 truncate">{lesson.title}</span>
                        <span className="ml-3 shrink-0 text-xs text-muted-foreground">
                          {lesson.preview && (
                            <span className="mr-2 rounded bg-primary/10 px-1.5 py-0.5 text-primary">
                              free preview
                            </span>
                          )}
                          {lesson.durationMin} min
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {showPreview && preview && (
            <section>
              <h2 className="text-lg font-semibold">Preview: {preview.title}</h2>
              <video src={preview.videoUrl} controls className="mt-2 w-full rounded-xl border border-border" />
            </section>
          )}

          <ReviewList reviews={courseReviews} />
        </div>

        <aside className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-3xl font-bold text-primary">{course.price} π</p>
            <p className="mt-1 text-xs text-muted-foreground">Lifetime access · pay in Pi only</p>

            {preview && (
              <button
                onClick={() => setShowPreview((v) => !v)}
                className="mt-3 w-full rounded-lg border border-input px-4 py-2 text-sm"
              >
                {showPreview ? "Hide free preview" : "Watch free preview"}
              </button>
            )}

            {hydrated && !user ? (
              <div className="mt-4">
                <PiSignInCard />
              </div>
            ) : enrolled ? (
              <Link
                to="/courses/learn/$id"
                params={{ id: course.id }}
                className="mt-3 block w-full rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Go to course
              </Link>
            ) : (
              <>
                <button
                  onClick={buy}
                  disabled={status.state === "pending"}
                  className="mt-3 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
                >
                  {status.state === "pending" ? "Processing…" : "Enrol with Pi"}
                </button>
                {status.state !== "idle" && (
                  <p
                    className={`mt-2 text-sm ${status.state === "error" ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {status.message}
                  </p>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
