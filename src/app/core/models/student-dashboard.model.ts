// src/app/core/models/student-dashboard.model.ts

// ── Frontend display models (used by components) ────────────────────────────

export interface EnrolledCourseItem {
  readonly id: string;
  readonly title: string;
  readonly teacherName: string;
  readonly subjectName: string;
  readonly completedLessons: number;
  readonly totalLessons: number;
  readonly progressPercent: number;
  readonly thumbnailUrl: string;
  readonly progressGradient: string;
}

export interface UpcomingExamItem {
  readonly id: string;
  readonly title: string;
  readonly timeText: string;
  readonly tagText: string;
  readonly borderMarkerColor: string;
  readonly isImportant: boolean;
}

export interface WeaknessTopicItem {
  readonly id: string;
  readonly topicTitle: string;
  readonly scorePercent: number;
  readonly barColor: string;
}

export interface StudentDashboardSummary {
  readonly studentName: string;
  readonly currentDateText: string;
  readonly scheduledExamsCount: number;
  readonly streakDays: number;
  readonly cumulativeAverage: number;
  readonly completedLessonsCount: number;
  readonly subscribedPackagesCount: number;
}

// ── API response shape (GET /api/v1/dashboard/student) ──────────────────────
// Confirmed against the live swagger spec (StudentDashboardDto), 2026-08-24.
// The previous version of this type had no field in common with the real
// contract except completedLessonsCount/subscribedPackagesCount by
// coincidence -- studentName, streakDays, cumulativeAverage,
// monthlyGrowthPercent, percentileRanking, enrolledCourses, and
// weaknessTopics never existed on the wire. There is no backend field at all
// for monthly growth or percentile ranking, so those were removed from the
// UI rather than left permanently showing "+0%" / "top 0%".

export interface DashboardApiUpcomingExam {
  examId: string;
  title?: string | null;
  startDate: string;
  endDate?: string | null;
}

export interface DashboardApiPointOfFocus {
  topicName?: string | null;
  proficiencyPercent: number;
}

export interface DashboardApiDailyLesson {
  materialId: string;
  title?: string | null;
  completedLectures: number;
  totalLectures: number;
}

export interface StudentDashboardApiResponse {
  overallAverage: number;
  completedLessonsCount: number;
  subscribedPackagesCount: number;
  urgentAlerts?: string[] | null;
  dailyLessons?: DashboardApiDailyLesson[] | null;
  upcomingExams?: DashboardApiUpcomingExam[] | null;
  pointsNeedingFocus?: DashboardApiPointOfFocus[] | null;
  lastActivityDate?: string | null;
  currentStreak: number;
}
