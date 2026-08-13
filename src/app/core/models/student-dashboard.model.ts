// src/app/core/models/student-dashboard.model.ts

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
