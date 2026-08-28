import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { uid, usePersistentState } from "@/lib/persist";
import type { Review } from "@/lib/freelance/types";
import { seedCourseReviews, seedCourses } from "./seed";
import type { Course, Enrollment, InstructorProfile } from "./types";

const LS = {
  instructors: "sellfy.instructors",
  courses: "sellfy.courses",
  enrollments: "sellfy.enrollments",
  reviews: "sellfy.courseReviews",
};

interface CoursesValue {
  hydrated: boolean;
  instructors: InstructorProfile[];
  courses: Course[];
  enrollments: Enrollment[];
  reviews: Review[];
  saveInstructor: (profile: InstructorProfile) => void;
  getInstructor: (uid: string) => InstructorProfile | undefined;
  addCourse: (course: Omit<Course, "id" | "createdAt">) => Course;
  enroll: (enrollment: Omit<Enrollment, "id" | "createdAt" | "completedLessonIds">) => void;
  isEnrolled: (courseId: string, uid: string) => boolean;
  toggleLessonComplete: (courseId: string, uid: string, lessonId: string) => void;
  progress: (courseId: string, uid: string, totalLessons: number) => number;
  addReview: (review: Omit<Review, "id" | "createdAt">) => void;
}

const Ctx = createContext<CoursesValue | null>(null);

export function CoursesProvider({ children }: { children: ReactNode }) {
  const [instructors, setInstructors, h1] = usePersistentState<InstructorProfile[]>(LS.instructors, []);
  const [userCourses, setUserCourses, h2] = usePersistentState<Course[]>(LS.courses, []);
  const [enrollments, setEnrollments] = usePersistentState<Enrollment[]>(LS.enrollments, []);
  const [userReviews, setUserReviews] = usePersistentState<Review[]>(LS.reviews, []);

  const courses = useMemo(() => [...userCourses, ...seedCourses], [userCourses]);
  const reviews = useMemo(() => [...userReviews, ...seedCourseReviews], [userReviews]);

  const saveInstructor = useCallback(
    (profile: InstructorProfile) =>
      setInstructors((prev) => [profile, ...prev.filter((p) => p.uid !== profile.uid)]),
    [setInstructors],
  );

  const getInstructor = useCallback(
    (id: string) => instructors.find((p) => p.uid === id),
    [instructors],
  );

  const addCourse = useCallback(
    (input: Omit<Course, "id" | "createdAt">) => {
      const course: Course = { ...input, id: uid("c"), createdAt: new Date().toISOString() };
      setUserCourses((prev) => [course, ...prev]);
      return course;
    },
    [setUserCourses],
  );

  const enroll = useCallback(
    (input: Omit<Enrollment, "id" | "createdAt" | "completedLessonIds">) =>
      setEnrollments((prev) =>
        prev.some((e) => e.courseId === input.courseId && e.uid === input.uid)
          ? prev
          : [
              {
                ...input,
                id: uid("e"),
                completedLessonIds: [],
                createdAt: new Date().toISOString(),
              },
              ...prev,
            ],
      ),
    [setEnrollments],
  );

  const isEnrolled = useCallback(
    (courseId: string, userUid: string) =>
      enrollments.some((e) => e.courseId === courseId && e.uid === userUid),
    [enrollments],
  );

  const toggleLessonComplete = useCallback(
    (courseId: string, userUid: string, lessonId: string) =>
      setEnrollments((prev) =>
        prev.map((e) =>
          e.courseId === courseId && e.uid === userUid
            ? {
                ...e,
                completedLessonIds: e.completedLessonIds.includes(lessonId)
                  ? e.completedLessonIds.filter((id) => id !== lessonId)
                  : [...e.completedLessonIds, lessonId],
              }
            : e,
        ),
      ),
    [setEnrollments],
  );

  const progress = useCallback(
    (courseId: string, userUid: string, totalLessons: number) => {
      const enrollment = enrollments.find((e) => e.courseId === courseId && e.uid === userUid);
      if (!enrollment || totalLessons === 0) return 0;
      return Math.round((enrollment.completedLessonIds.length / totalLessons) * 100);
    },
    [enrollments],
  );

  const addReview = useCallback(
    (input: Omit<Review, "id" | "createdAt">) =>
      setUserReviews((prev) => [
        { ...input, id: uid("cr"), createdAt: new Date().toISOString() },
        ...prev,
      ]),
    [setUserReviews],
  );

  const value: CoursesValue = {
    hydrated: h1 && h2,
    instructors,
    courses,
    enrollments,
    reviews,
    saveInstructor,
    getInstructor,
    addCourse,
    enroll,
    isEnrolled,
    toggleLessonComplete,
    progress,
    addReview,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCourses(): CoursesValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCourses must be used within CoursesProvider");
  return ctx;
}
