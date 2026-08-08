/** Data model for the Online Courses module (Udemy-style). */

export const COURSE_CATEGORIES = [
  "Development",
  "Business",
  "Design",
  "Marketing",
  "Personal Growth",
] as const;
export type CourseCategory = (typeof COURSE_CATEGORIES)[number];

export const COURSE_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

export interface InstructorProfile {
  uid: string;
  username: string;
  avatar: string;
  headline: string;
  bio: string;
  expertise: string[];
  createdAt: string;
}

export interface LessonResource {
  name: string;
  url: string;
}

export interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  durationMin: number;
  /** One lesson per course can be watched for free before enrolling. */
  preview: boolean;
  resources: LessonResource[];
}

export interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  instructorUid: string;
  instructorName: string;
  title: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  price: number; // Pi
  cover: string;
  sections: Section[];
  createdAt: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  uid: string;
  username: string;
  paymentId: string;
  txid: string;
  price: number;
  completedLessonIds: string[];
  createdAt: string;
}

export function courseLessons(course: Course): Lesson[] {
  return course.sections.flatMap((s) => s.lessons);
}

export function courseDuration(course: Course): number {
  return courseLessons(course).reduce((sum, l) => sum + l.durationMin, 0);
}
