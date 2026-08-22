// src/app/features/teacher/models/teacher-dashboard.model.ts
export interface TeacherKpiStat {
  id: string;
  labelKey: string;
  value: string;
  changeNoteKey: string;
  changeType?: 'up' | 'down' | 'neutral';
  badgeKey?: string;
  iconType: 'students' | 'average' | 'exams' | 'messages';
}

export interface TeacherAiAlertBanner {
  titleKey: string;
  subtitleKey: string;
  reportsCount: number;
  ctaKey: string;
}

export interface StudentNeedFollowup {
  id: string;
  studentName: string;
  initials: string;
  courseName: string;
  averageScore: number;
  riskLevel: 'high' | 'medium';
}

export interface RecentSubmission {
  id: string;
  studentName: string;
  initials: string;
  timeAgoKey: string;
  examTitle: string;
  score: number;
  gradeType: 'excellent' | 'good' | 'average';
}

export interface SubmissionChartPoint {
  dayNameKey: string;
  submissionsCount: number;
  averageScore: number;
}

export interface SubmissionsChartMeta {
  totalSubmissions: number;
  averagePerformance: number;
  peakDayKey: string;
  timeRange: 'week' | 'month' | 'quarter';
  chartPoints: SubmissionChartPoint[];
}

// ── Backend DTOs ──────────────────────────────────────────────────────────

export interface WeeklySubmissionsActivityDto {
  dayOfWeek: string;
  submissionsCount: number;
  averageScore: number;
}

export interface NeedsAttentionDto {
  studentId: string;
  studentName: string;
  classroomName?: string;
  overallAverage: number;
}

export interface RecentSubmissionDto {
  examAttemptId: string;
  studentId: string;
  studentName: string;
  examTitle: string;
  submittedAt: string;
  score: number;
}

export interface TeacherDashboardDto {
  examsAwaitingReview: number;
  classAverage: number;
  activeStudents: number;
  reportsReadyForReview: number;
  newMessagesCount: number;
  weeklySubmissionsActivity: WeeklySubmissionsActivityDto[];
  needsAttentionList: NeedsAttentionDto[];
  recentSubmissions: RecentSubmissionDto[];
}

export interface TeacherUrgentAlert {
  id: string;
  titleKey: string;
  titleParams?: Record<string, string | number>;
  timeKey?: string;
  tagKey: string;
  isDanger?: boolean;
  isWarning?: boolean;
}

