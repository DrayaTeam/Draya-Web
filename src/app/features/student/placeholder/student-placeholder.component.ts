// src/app/features/student/placeholder/student-placeholder.component.ts
import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface FeatureMeta {
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  mockStats: { label: string; value: string }[];
}

@Component({
  selector: 'draya-student-placeholder',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './student-placeholder.component.html',
  styleUrl: './student-placeholder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class StudentPlaceholderComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly meta = signal<FeatureMeta>({
    title: 'قسم جديد',
    subtitle: 'جارٍ إعداد وتجهيز الصفحة...',
    badge: 'قيد التطوير 🚀',
    icon: 'book',
    mockStats: [],
  });

  ngOnInit(): void {
    const routePath = this.route.snapshot.routeConfig?.path ?? '';

    switch (routePath) {
      case 'courses':
        this.meta.set({
          title: 'كورساتي والمواد الدراسية',
          subtitle: 'استعراض المواد المسجلة، متابعة الدروس المحفوظة والمحاضرات التفاعلية.',
          badge: 'قيد التجهيز 📚',
          icon: 'courses',
          mockStats: [
            { label: 'الكورسات المسجلة', value: '3 مواد' },
            { label: 'الدروس المكتملة', value: '24 درس' },
            { label: 'نسبة التقدم', value: '78%' },
          ],
        });
        break;

      case 'exams':
        this.meta.set({
          title: 'مركز الامتحانات والاختبارات',
          subtitle: 'الخضوع للامتحانات المحددة بوقت، متابعة النتائج والإجابات النموذجية.',
          badge: 'نسخة تجريبية 📝',
          icon: 'exams',
          mockStats: [
            { label: 'الامتحانات المتاحة', value: '4 امتحانات' },
            { label: 'الامتحانات المكتملة', value: '12 امتحان' },
            { label: 'متوسط الدرجات', value: '91%' },
          ],
        });
        break;

      case 'reports':
        this.meta.set({
          title: 'تقاريري ودرجاتي ومستواي',
          subtitle: 'تحليل الأداء الأكاديمي، النقاط المستهدفة للتحسين، والتقارير الذكية.',
          badge: 'قيد الربط 📊',
          icon: 'reports',
          mockStats: [
            { label: 'التقارير المولدة', value: '8 تقارير' },
            { label: 'مستوى الأداء', value: 'ممتاز 🌟' },
            { label: 'نقاط القوة', value: 'الفيزياء والجبر' },
          ],
        });
        break;

      case 'library':
        this.meta.set({
          title: 'المكتبة الشاملة والملفات',
          subtitle: 'تحميل المذكرات الدراسية، ملخصات المواد، والفيديوهات التوضيحية.',
          badge: 'قريباً 📂',
          icon: 'library',
          mockStats: [
            { label: 'الملخصات المحفوظة', value: '18 ملف' },
            { label: 'الفيديوهات', value: '14 فيديو' },
            { label: 'المكتبة العامة', value: 'متاحة' },
          ],
        });
        break;

      default:
        this.meta.set({
          title: 'قسم الطالب التعليمي',
          subtitle: 'هذه الصفحة قيد الإعداد وستتاح قريباً مع كامل البيانات.',
          badge: 'قريباً 🚀',
          icon: 'default',
          mockStats: [],
        });
    }
  }
}
