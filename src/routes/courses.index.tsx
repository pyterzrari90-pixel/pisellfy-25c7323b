import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Stars } from "@/components/Stars";
import { useCourses } from "@/lib/courses/store";
import { COURSE_CATEGORIES, COURSE_LEVELS, courseDuration, courseLessons } from "@/lib/courses/types";
import { averageRating } from "@/lib/freelance/types";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Online Courses — learn and pay in Pi | sellfy" },
      {
        name: "description",
        content:
          "Browse online courses in development, design, marketing and business. Enrol with Pi and track your progress lesson by lesson.",
      },
      { property: "og:title", content: "Online Courses on sellfy" },
      { property: "og:description", content: "Enrol in courses and pay in Pi inside the Pi Browser." },
    ],
  }),
  component: CourseCatalog,
});

function CourseCatalog() {
  const { courses, reviews } = useCourses();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState(0);

  const results = useMemo(
    () =>
      courses.filter((course) => {
        const rating = averageRating(reviews.filter((r) => r.targetId === course.id));
        if (query && !`${course.title} ${course.description}`.toLowerCase().includes(query.toLowerCase()))
          return false;
        if (category !== "all" && course.category !== category) return false;
        if (level !== "all" && course.level !== level) return false;
        if (maxPrice && course.price > Number(maxPrice)) return false;
        if (minRating && rating < minRating) return false;
        return true;
      }),
    [courses, reviews, query, category, level, maxPrice, minRating],
  );

  const field =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary";

  return (
    <AppShell>
      <section className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Online Courses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Learn new skills, pay in Pi, keep lifetime access with progress tracking.
        </p>
      </section>

      <div className="mt-6 space-y-3 rounded-xl border border-border bg-card p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses…"
          maxLength={80}
          className={field}
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("all")}
            className={`rounded-full border px-3 py-1 text-xs ${category === "all" ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}
          >
            All
          </button>
          {COURSE_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-1 text-xs ${category === c ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <label className="text-xs text-muted-foreground">
            Level
            <select value={level} onChange={(e) => setLevel(e.target.value)} className={field}>
              <option value="all">Any</option>
              {COURSE_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">
            Max price (π)
            <input type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={field} />
          </label>
          <label className="text-xs text-muted-foreground">
            Min rating
            <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className={field}>
              <option value={0}>Any</option>
              <option value={3}>3★ and up</option>
              <option value={4}>4★ and up</option>
              <option value={4.5}>4.5★ and up</option>
            </select>
          </label>
        </div>
      </div>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((course) => {
          const courseReviews = reviews.filter((r) => r.targetId === course.id);
          return (
            <Link
              key={course.id}
              to="/courses/$id"
              params={{ id: course.id }}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary"
            >
              <img src={course.cover} alt={course.title} loading="lazy" className="aspect-video w-full object-cover" />
              <div className="p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {course.category} · {course.level}
                </p>
                <h2 className="mt-1 line-clamp-2 text-sm font-medium">{course.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {courseLessons(course).length} lessons · {courseDuration(course)} min
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <Stars rating={averageRating(courseReviews)} count={courseReviews.length} />
                  <span className="text-sm font-semibold text-primary">{course.price} π</span>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">@{course.instructorName}</p>
              </div>
            </Link>
          );
        })}
      </section>

      {results.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">No course matches those filters.</p>
      )}
    </AppShell>
  );
}
