// src/app/core/models/student-reports.model.ts

export interface StudentReportSummary {
  readonly overallAverage: number;
  readonly monthlyGrowthPercent: number;
  readonly completedExamsCount: number;
  readonly topScorePercent: number;
  readonly topSkillSubjectName: string;
  readonly topSkillScorePercent: number;
}

export interface SubjectScoreItem {
  readonly id: string;
  readonly subjectName: string;
  readonly scorePercent: number;
  readonly progressGradient: string;
  readonly textColor: string;
  readonly bgColor: string;
}

export interface ReportWeaknessTopic {
  readonly id: string;
  readonly topicTitle: string;
  readonly subjectName: string;
  readonly badgeText: string;
  readonly scorePercent: number;
  readonly barMarkerColor: string;
  readonly badgeBgColor: string;
  readonly badgeTextColor: string;
  readonly scoreTextColor: string;
}

export interface SkillRadarPoint {
  readonly name: string;
  readonly percent: number;
}

export interface TopicRevisionDto {
  readonly topicName: string;
  readonly recommendation?: string;
  readonly aiExplanation?: string;
  readonly keyFormulas?: readonly string[];
}

export interface CreatePracticeExamResponseDto {
  readonly examId: string;
  readonly attemptId?: string;
  readonly title?: string;
  readonly questionsCount?: number;
}
