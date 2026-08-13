// src/app/core/services/student-dashboard.service.ts
import { Injectable, signal } from '@angular/core';
import {
  EnrolledCourseItem,
  UpcomingExamItem,
  WeaknessTopicItem,
  StudentDashboardSummary,
} from '../models/student-dashboard.model';

@Injectable({ providedIn: 'root' })
export class StudentDashboardService {
  // Summary Stats Signal
  readonly summary = signal<StudentDashboardSummary>({
    studentName: 'أحمد',
    currentDateText: 'الأحد، 20 يوليو 2026',
    scheduledExamsCount: 2,
    streakDays: 5,
    cumulativeAverage: 87,
    completedLessonsCount: 37,
    subscribedPackagesCount: 3,
    monthlyGrowthPercent: 4,
    percentileRanking: 92,
  });

  // Daily Enrolled Courses Signal (3 items matching Figma screenshot)
  readonly enrolledCourses = signal<EnrolledCourseItem[]>([
    {
      id: 'crs-1',
      title: 'الجبر وحساب المثلثات',
      teacherName: 'أ. محمد علي',
      subjectName: 'الرياضيات',
      completedLessons: 12,
      totalLessons: 18,
      progressPercent: 68,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=400&auto=format&fit=crop',
      progressGradient: 'linear-gradient(90deg, #00A6F4 0%, #4F39F6 100%)',
    },
    {
      id: 'crs-2',
      title: 'الفيزياء الكهربية والحديثة',
      teacherName: 'أ. سارة حسن',
      subjectName: 'الفيزياء',
      completedLessons: 8,
      totalLessons: 20,
      progressPercent: 40,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=400&auto=format&fit=crop',
      progressGradient: 'linear-gradient(90deg, #AD46FF 0%, #E60076 100%)',
    },
    {
      id: 'crs-3',
      title: 'الكيمياء العضوية المتقدمة',
      teacherName: 'أ. أحمد سامي',
      subjectName: 'الكيمياء',
      completedLessons: 17,
      totalLessons: 20,
      progressPercent: 85,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=400&auto=format&fit=crop',
      progressGradient: 'linear-gradient(90deg, #00BC7D 0%, #009689 100%)',
    },
  ]);

  // Upcoming Exams Schedule Signal
  readonly upcomingExams = signal<UpcomingExamItem[]>([
    {
      id: 'ex-1',
      title: 'اختبار الباب الثالث (جبر)',
      timeText: 'غداً 10:00 ص',
      tagText: 'هام',
      borderMarkerColor: '#FF2056',
      isImportant: true,
    },
    {
      id: 'ex-2',
      title: 'مراجعة قانون كيرشوف (فيزياء)',
      timeText: 'الخميس 11:00 ص',
      tagText: 'مراجعة',
      borderMarkerColor: '#FE9A00',
      isImportant: false,
    },
  ]);

  // Weakness Improvement Topics Signal
  readonly weaknessTopics = signal<WeaknessTopicItem[]>([
    {
      id: 'wk-1',
      topicTitle: 'المشتقات والاتصال الرياضي',
      scorePercent: 42,
      barColor: '#FF2056',
    },
    {
      id: 'wk-2',
      topicTitle: 'الدوائر المغلقة وقوانين أوم',
      scorePercent: 55,
      barColor: '#FE9A00',
    },
  ]);
}
