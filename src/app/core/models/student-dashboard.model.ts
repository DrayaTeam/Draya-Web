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
  readonly monthlyGrowthPercent: number;
  readonly percentileRanking: number;
}

// ── API response shape (GET /api/v1/dashboard/student) ──────────────────────

export interface DashboardApiEnrolledCourse {
  id: string;
  title: string;
  teacherName: string;
  subjectName: string;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
  thumbnailUrl: string;
}

export interface DashboardApiUpcomingExam {
  id: string;
  title: string;
  timeText: string;
  isImportant: boolean;
}

export interface DashboardApiWeaknessTopic {
  id: string;
  topicTitle: string;
  scorePercent: number;
}

export interface StudentDashboardApiResponse {
  studentName: string;
  streakDays: number;
  cumulativeAverage: number;
  completedLessonsCount: number;
  subscribedPackagesCount: number;
  scheduledExamsCount: number;
  monthlyGrowthPercent: number;
  percentileRanking: number;
  enrolledCourses: DashboardApiEnrolledCourse[];
  upcomingExams: DashboardApiUpcomingExam[];
  weaknessTopics: DashboardApiWeaknessTopic[];
}
