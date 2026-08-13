// src/app/core/services/student-reports.service.ts

import { Injectable, signal } from '@angular/core';
import {
  StudentReportSummary,
  SubjectScoreItem,
  ReportWeaknessTopic,
  SkillRadarPoint,
} from '../models/student-reports.model';

@Injectable({
  providedIn: 'root',
})
export class StudentReportsService {
  readonly summary = signal<StudentReportSummary>({
    overallAverage: 87,
    monthlyGrowthPercent: 5,
    completedExamsCount: 12,
    topScorePercent: 94,
    topSkillSubjectName: 'الكيمياء',
    topSkillScorePercent: 91,
  });

  readonly subjectScores = signal<readonly SubjectScoreItem[]>([
    {
      id: 'math',
      subjectName: 'الرياضيات',
      scorePercent: 87,
      progressGradient: 'linear-gradient(90deg, #00A6F4 0%, #4F39F6 100%)',
      textColor: '#0084D1',
      bgColor: '#F0F9FF',
    },
    {
      id: 'physics',
      subjectName: 'الفيزياء',
      scorePercent: 82,
      progressGradient: 'linear-gradient(90deg, #AD46FF 0%, #E60076 100%)',
      textColor: '#9810FA',
      bgColor: '#FAF5FF',
    },
    {
      id: 'chemistry',
      subjectName: 'الكيمياء',
      scorePercent: 91,
      progressGradient: 'linear-gradient(90deg, #00BC7D 0%, #009689 100%)',
      textColor: '#009966',
      bgColor: '#ECFDF5',
    },
  ]);

  readonly weaknessTopics = signal<readonly ReportWeaknessTopic[]>([
    {
      id: 'weakness-1',
      topicTitle: 'المشتقات والتكامل وتطبيقات المساحات',
      subjectName: 'الرياضيات',
      badgeText: 'تحتاج تحسين عاجل',
      scorePercent: 42,
      barMarkerColor: '#FF2056',
      badgeBgColor: '#FFE4E6',
      badgeTextColor: '#A50036',
      scoreTextColor: '#EC003F',
    },
    {
      id: 'weakness-2',
      topicTitle: 'الدوائر الكهربية وقانون أوم للمغلقة',
      subjectName: 'الفيزياء',
      badgeText: 'في طور التحسن',
      scorePercent: 55,
      barMarkerColor: '#FE9A00',
      badgeBgColor: '#FEF3C6',
      badgeTextColor: '#973C00',
      scoreTextColor: '#E17100',
    },
  ]);

  readonly skillRadarPoints = signal<readonly SkillRadarPoint[]>([
    { name: 'رياضيات', percent: 85 },
    { name: 'فيزياء', percent: 78 },
    { name: 'كيمياء', percent: 91 },
    { name: 'أحياء', percent: 88 },
    { name: 'لغات', percent: 80 },
  ]);
}
