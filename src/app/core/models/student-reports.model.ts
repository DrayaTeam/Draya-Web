// src/app/core/models/student-reports.model.ts

export interface StudentReportSummary {
  readonly overallAverage: number;
  readonly monthlyGrowthPercent: number;
  readonly completedExamsCount: number;
  readonly topScorePercent: number;
  readonly topSkillSubjectName: string;
  readonly topSkillScorePercent: number;
  readonly summaryText?: string;
  readonly generatedAt?: string;
  readonly reportId?: string;
  readonly totalQuestionsAsked?: number;
  readonly totalQuestionsReplied?: number;
  readonly averageExamDurationMinutes?: number;
  readonly completedLessons?: number;
  readonly classroomPercentile?: number;
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
  readonly subjectId?: string;
  readonly badgeText: string;
  readonly scorePercent: number;
  readonly barMarkerColor: string;
  readonly badgeBgColor: string;
  readonly badgeTextColor: string;
  readonly scoreTextColor: string;
  readonly recommendation?: string;
  readonly exampleIncorrectAnswers?: readonly string[];
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
  readonly exampleIncorrectAnswers?: readonly string[];
}

export interface PracticeExamRequest {
  readonly subjectId?: string;
}

export interface CreatePracticeExamResponseDto {
  readonly examId: string;
  readonly attemptId?: string;
  readonly title?: string;
  readonly questionsCount?: number;
}

export interface SubjectProficiencyResult {
  readonly subjectId?: string;
  readonly subjectName?: string;
  readonly proficiencyScore?: number;
  readonly scorePercentage?: number;
  readonly proficiencyPercent?: number;
}

export interface SubjectProficiencyDto {
  readonly subjectName?: string;
  readonly proficiencyPercent?: number;
}

export interface TrendPointResult {
  readonly month?: string;
  readonly monthName?: string;
  readonly averageScore?: number;
}

export interface WeakTopicResult {
  readonly topicId?: string;
  readonly topicTitle?: string;
  readonly topicName?: string;
  readonly subjectName?: string;
  readonly accuracyPercentage?: number;
  readonly proficiencyPercent?: number;
  readonly status?: string;
  readonly statusLabel?: string;
  readonly recommendation?: string;
  readonly exampleIncorrectAnswers?: string[];
}

export interface WeakTopicDto {
  readonly topicName?: string;
  readonly proficiencyPercent?: number;
  readonly recommendation?: string;
}

export interface StudentAnalyticsDto {
  readonly overallAverage?: number;
  readonly highestScore?: number;
  readonly completedExams?: number;
  readonly subjectProficiencies?: SubjectProficiencyResult[];
  readonly trendPoints?: TrendPointResult[];
  readonly weakTopics?: WeakTopicResult[];
}

export interface PerformanceReportDto {
  readonly id?: string;
  readonly generatedAt?: string;
  readonly summaryText?: string;
  readonly weakTopics?: WeakTopicDto[] | WeakTopicResult[];
  readonly subjectProficiencies?: SubjectProficiencyDto[] | SubjectProficiencyResult[];
  readonly totalQuestionsAsked?: number;
  readonly totalQuestionsReplied?: number;
  readonly averageExamDurationMinutes?: number;
  readonly completedLessons?: number;
  readonly classroomPercentile?: number;
}
