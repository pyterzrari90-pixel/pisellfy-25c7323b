import { useMemo, useState } from "react";
import {
  BookOpen,
  GraduationCap,
  MessageSquare,
  PlusCircle,
  Star,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import {
  ActivityList,
  ActivityRow,
  BarChart,
  DashboardHeader,
  EmptyState,
  PeriodFilter,
  QuickActions,
  Section,
  StatCard,
  StatGrid,
  StatusBadge,
  buildSeries,
  trendPercent,
  withinPeriod,
  type PeriodId,
} from "@/components/dashboard/kit";
import { Stars } from "@/components/Stars";
import { useCourses } from "@/lib/courses/store";
import { averageRating } from "@/lib/freelance/types";
import { useStore } from "@/lib/marketplace/store";

export function InstructorDashboard() {
  const { user } = useStore();
  const { courses, enrollments, reviews, getInstructor } = useCourses();
  const [period, setPeriod] = useState<PeriodId>("month");

  const myCourses = useMemo(
    () => courses.filter((c) => c.instructorUid === user?.uid),
    [courses, user],
  );
  const myEnrollments = useMemo(
    () => enrollments.filter((e) => myCourses.some((c) => c.id === e.courseId)),
    [enrollments, myCourses],
  );
  const inPeriod = myEnrollments.filter((e) => withinPeriod(e.createdAt, period));
  const revenue = inPeriod.reduce((s, e) => s + e.price, 0);
  const myReviews = reviews.filter((r) => myCourses.some((c) => c.id === r.targetId));
  const profile = user ? getInstructor(user.uid) : undefined;
  const series = useMemo(
    () => buildSeries(myEnrollments.map((e) => ({ createdAt: e.createdAt, value: e.price })), 30),
    [myEnrollments],
  );

  return (
    <>
      <DashboardHeader
        title="Instructor dashboard"
        subtitle={profile?.headline ?? "Your courses, students and Pi revenue"}
        icon={GraduationCap}
        actions={<PeriodFilter value={period} onChange={setPeriod} />}
      />

      <StatGrid>
        <StatCard
          label="Revenue"
          value={`${revenue.toFixed(2)} π`}
          icon={Wallet}
          accent="gold"
          trend={trendPercent(series)}
          hint="This period"
        />
        <StatCard label="Students" value={myEnrollments.length} icon={Users} accent="success" hint="All time" />
        <StatCard label="Courses" value={myCourses.length} icon={BookOpen} />
        <StatCard
          label="Rating"
          value={<Stars rating={averageRating(myReviews)} count={myReviews.length} />}
          icon={Star}
        />
      </StatGrid>

      <Section title="Enrolment revenue" description="Last 30 days">
        <BarChart series={series} emptyLabel="No enrolment yet — publish a course to start earning Pi." />
      </Section>

      <Section title="Revenue per course">
        {myCourses.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No course created yet — start teaching!"
            description="Share your expertise with the Pi community. Build a course in minutes and get paid in Pi."
            actionLabel="Create a course"
            to="/courses/new"
          />
        ) : (
          <ActivityList>
            {myCourses.map((course) => {
              const students = enrollments.filter((e) => e.courseId === course.id);
              const rating = averageRating(reviews.filter((r) => r.targetId === course.id));
              return (
                <ActivityRow
                  key={course.id}
                  to="/courses/$id"
                  params={{ id: course.id }}
                  title={course.title}
                  meta={
                    <>
                      {students.length} student{students.length === 1 ? "" : "s"} · {course.price} π ·{" "}
                      <Stars rating={rating} />
                    </>
                  }
                  badge={<StatusBadge tone="success">published</StatusBadge>}
                  amount={`${students.reduce((s, e) => s + e.price, 0).toFixed(2)} π`}
                />
              );
            })}
          </ActivityList>
        )}
      </Section>

      <Section title="Latest reviews">
        {myReviews.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No review yet"
            description="Reviews appear as soon as your students complete lessons and share feedback."
          />
        ) : (
          <ul className="space-y-3">
            {myReviews.slice(0, 6).map((review) => (
              <li
                key={review.id}
                className="animate-fade-up rounded-2xl border border-border bg-gradient-card p-4 text-sm shadow-soft"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-semibold">@{review.authorName}</span>
                  <Stars rating={review.rating} />
                </div>
                <p className="mt-1 text-muted-foreground">{review.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Quick actions">
        <QuickActions
          actions={[
            { label: "New course", to: "/courses/new", icon: PlusCircle, primary: true },
            { label: "Withdraw earnings", to: "/courses/dashboard", icon: Wallet },
            { label: "Browse catalog", to: "/courses", icon: TrendingUp },
            { label: "Edit profile", to: "/courses/become", icon: GraduationCap },
          ]}
        />
      </Section>
    </>
  );
}
