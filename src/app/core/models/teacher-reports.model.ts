// src/app/core/models/teacher-reports.model.ts

export interface PerformanceReportDto {
  readonly id: string;
  readonly generatedAt: string;
  readonly summaryText: string;
  readonly weakTopics: ReportWeakTopicDto[];
  readonly subjectProficiencies: ReportSubjectProficiencyDto[];
}

export interface ReportWeakTopicDto {
  readonly topicName: string;
  readonly proficiencyPercent: number;
  readonly recommendation: string;
}

export interface ReportSubjectProficiencyDto {
  readonly subjectName: string;
  readonly proficiencyPercent: number;
}

export interface StudentAnalyticsDto {
  readonly overallAverage: number;
  readonly highestScore: number;
  readonly completedExams: number;
  readonly subjectProficiencies: ReportSubjectProficiencyDto[];
  readonly trendPoints: TrendPointDto[];
  readonly weakTopics: AnalyticsWeakTopicDto[];
}

export interface TrendPointDto {
  readonly month: string; // ISO Date string
  readonly averageScore: number;
}

export interface AnalyticsWeakTopicDto {
  readonly topicName: string;
  readonly subjectName: string;
  readonly proficiencyPercent: number;
  readonly status: string;
  readonly exampleIncorrectAnswers: string[];
}

export interface InteractiveReviewDto {
  readonly recommendation: string;
  readonly aiExplanation: string;
}
