// src/app/features/teacher/placeholder/teacher-placeholder.component.ts
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
  selector: 'draya-teacher-placeholder',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './teacher-placeholder.component.html',
  styleUrl: './teacher-placeholder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class TeacherPlaceholderComponent implements OnInit {
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
          title: 'باقاتي الدراسية والصفوف',
          subtitle: 'إدارة وتخصيص الكورسات، الحصص التفاعلية، ورسوم الاشتراكات للطلاب.',
          badge: 'قيد التجهيز 📚',
          icon: 'courses',
          mockStats: [
            { label: 'الباقات النشطة', value: '3 باقات' },
            { label: 'المجموعات الدراسية', value: '12 مجموعة' },
            { label: 'إجمالي الطلاب', value: '410 طلاب' },
          ],
        });
        break;

      case 'exams':
        this.meta.set({
          title: 'مركز الامتحانات وتصحيح AI',
          subtitle: 'إنشاء الامتحانات الآلية الذكية، بنك الأسئلة والتصحيح التلقائي للأوراق.',
          badge: 'نسخة تجريبية 📝',
          icon: 'exams',
          mockStats: [
            { label: 'الامتحانات المفعلة', value: '8 امتحانات' },
            { label: 'أسئلة بنك الذكاء', value: '1,250 سؤال' },
            { label: 'متوسط النسبة', value: '87%' },
          ],
        });
        break;

      case 'reports':
        this.meta.set({
          title: 'درجاتي وتقاريري وتصحيحي',
          subtitle: 'تقارير أداء الطلاب الشاملة، التحليلات البيانية، وتصحيح الواجبات التفاعلي.',
          badge: 'قيد الربط 📊',
          icon: 'reports',
          mockStats: [
            { label: 'التقارير المولدة', value: '45 تقرير' },
            { label: 'نسبة الحضور', value: '94%' },
            { label: 'التصحيحات المعلقة', value: '3 واجبات' },
          ],
        });
        break;

      case 'library':
        this.meta.set({
          title: 'المكتبة الشاملة والملفات',
          subtitle: 'رفع وتخزين المذكرات الدراسية، كتب PDF، والفيديوهات التوضيحية.',
          badge: 'قريباً 📂',
          icon: 'library',
          mockStats: [
            { label: 'ملفات PDF', value: '64 ملف' },
            { label: 'الفيديوهات', value: '28 فيديو' },
            { label: 'المساحة المستهلكة', value: '8.2 GB' },
          ],
        });
        break;

      default:
        this.meta.set({
          title: 'قسم درايَة التعليمي',
          subtitle: 'هذه الصفحة قيد الإعداد وستتاح قريباً مع كامل البيانات.',
          badge: 'قريباً 🚀',
          icon: 'default',
          mockStats: [],
        });
    }
  }
}
