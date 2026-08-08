import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { AppShell } from "@/components/AppShell";
import { PiSignInGate } from "@/components/PiSignIn";
import { useCourses } from "@/lib/courses/store";
import {
  COURSE_CATEGORIES,
  COURSE_LEVELS,
  type CourseCategory,
  type CourseLevel,
  type Section,
} from "@/lib/courses/types";
import { useStore } from "@/lib/marketplace/store";
import { uid } from "@/lib/persist";

export const Route = createFileRoute("/courses/new")({
  head: () => ({
    meta: [
      { title: "Create a course — sellfy Courses" },
      { name: "description", content: "Build a course with sections, lessons, videos and downloadable resources, priced in Pi." },
      { property: "og:title", content: "Create a course on sellfy" },
      { property: "og:description", content: "Publish sections and lessons, priced in Pi." },
    ],
  }),
  component: NewCoursePage,
});

const field =
  "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary";

interface DraftLesson {
  title: string;
  videoUrl: string;
  durationMin: number;
  preview: boolean;
  resources: string;
}
interface DraftSection {
  title: string;
  lessons: DraftLesson[];
}

const emptyLesson: DraftLesson = {
  title: "",
  videoUrl: "",
  durationMin: 10,
  preview: false,
  resources: "",
};

function NewCoursePage() {
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">Create a course</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Structure your course in sections and lessons. Learners pay once, in Pi.
      </p>
      <div className="mt-4">
        <PiSignInGate>
          <CourseForm />
        </PiSignInGate>
      </div>
    </AppShell>
  );
}

function CourseForm() {
  const { user } = useStore();
  const { addCourse } = useCourses();
  const navigate = useNavigate();
  const [sections, setSections] = useState<DraftSection[]>([
    { title: "Getting started", lessons: [{ ...emptyLesson }] },
  ]);

  function update(sectionIndex: number, patch: Partial<DraftSection>) {
    setSections((prev) => prev.map((s, i) => (i === sectionIndex ? { ...s, ...patch } : s)));
  }
  function updateLesson(sectionIndex: number, lessonIndex: number, patch: Partial<DraftLesson>) {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIndex
          ? { ...s, lessons: s.lessons.map((l, j) => (j === lessonIndex ? { ...l, ...patch } : l)) }
          : s,
      ),
    );
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const form = new FormData(event.currentTarget);
    const built: Section[] = sections
      .filter((s) => s.title.trim())
      .map((s) => ({
        id: uid("s"),
        title: s.title.trim(),
        lessons: s.lessons
          .filter((l) => l.title.trim())
          .map((l) => ({
            id: uid("l"),
            title: l.title.trim(),
            videoUrl: l.videoUrl.trim(),
            durationMin: Number(l.durationMin) || 5,
            preview: l.preview,
            resources: l.resources
              .split(",")
              .map((r) => r.trim())
              .filter(Boolean)
              .map((url) => ({ name: url.split("/").pop() || "resource", url })),
          })),
      }))
      .filter((s) => s.lessons.length > 0);
    if (built.length === 0) return;

    const price = Number(form.get("price"));
    if (!Number.isFinite(price) || price <= 0) return;

    const course = addCourse({
      instructorUid: user.uid,
      instructorName: user.username,
      title: String(form.get("title") ?? "").trim().slice(0, 120),
      description: String(form.get("description") ?? "").trim().slice(0, 1500),
      category: String(form.get("category") ?? "Development") as CourseCategory,
      level: String(form.get("level") ?? "beginner") as CourseLevel,
      price,
      cover:
        String(form.get("cover") ?? "").trim() ||
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=70",
      sections: built,
    });
    void navigate({ to: "/courses/$id", params: { id: course.id } });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div>
        <label htmlFor="title" className="text-sm font-medium">Course title</label>
        <input id="title" name="title" required maxLength={120} className={field} />
      </div>
      <div>
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <textarea id="description" name="description" required rows={4} maxLength={1500} className={field} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="category" className="text-sm font-medium">Category</label>
          <select id="category" name="category" className={field}>
            {COURSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="level" className="text-sm font-medium">Level</label>
          <select id="level" name="level" className={field}>
            {COURSE_LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="price" className="text-sm font-medium">Price (π)</label>
          <input id="price" name="price" type="number" step="0.01" min="0.01" required className={field} />
        </div>
        <div>
          <label htmlFor="cover" className="text-sm font-medium">Cover image URL</label>
          <input id="cover" name="cover" type="url" placeholder="https://…" className={field} />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold">Curriculum</p>
        {sections.map((section, si) => (
          <fieldset key={si} className="rounded-lg border border-border p-3">
            <legend className="px-1 text-xs uppercase tracking-wide text-muted-foreground">
              Section {si + 1}
            </legend>
            <input
              value={section.title}
              onChange={(e) => update(si, { title: e.target.value })}
              placeholder="Section title"
              maxLength={80}
              className={field}
            />
            {section.lessons.map((lesson, li) => (
              <div key={li} className="mt-3 space-y-2 rounded-md border border-border/60 p-2">
                <input
                  value={lesson.title}
                  onChange={(e) => updateLesson(si, li, { title: e.target.value })}
                  placeholder="Lesson title"
                  maxLength={100}
                  className={field}
                />
                <input
                  value={lesson.videoUrl}
                  onChange={(e) => updateLesson(si, li, { videoUrl: e.target.value })}
                  placeholder="Video URL (mp4 or hosted link)"
                  className={field}
                />
                <input
                  value={lesson.resources}
                  onChange={(e) => updateLesson(si, li, { resources: e.target.value })}
                  placeholder="Downloadable resource URLs (comma separated)"
                  className={field}
                />
                <div className="flex items-center gap-3">
                  <label className="text-xs text-muted-foreground">
                    Duration (min)
                    <input
                      type="number"
                      min="1"
                      value={lesson.durationMin}
                      onChange={(e) => updateLesson(si, li, { durationMin: Number(e.target.value) })}
                      className={field}
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={lesson.preview}
                      onChange={(e) => updateLesson(si, li, { preview: e.target.checked })}
                    />
                    Free preview
                  </label>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => update(si, { lessons: [...section.lessons, { ...emptyLesson }] })}
              className="mt-3 rounded-md border border-input px-3 py-1.5 text-xs"
            >
              + Add lesson
            </button>
          </fieldset>
        ))}
        <button
          type="button"
          onClick={() => setSections((prev) => [...prev, { title: "", lessons: [{ ...emptyLesson }] }])}
          className="rounded-md border border-input px-3 py-1.5 text-xs"
        >
          + Add section
        </button>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        Publish course
      </button>
    </form>
  );
}
