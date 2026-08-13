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
      case 'packages':
        this.meta.set({
          title: 'باقات الكورسات والدروس',
          subtitle: 'إدارة وتخصيص الباقات الدراسية، أسعار الحصص والمجموعات التفاعلية.',
          badge: 'قيد التجهيز 📦',
          icon: 'packages',
          mockStats: [
            { label: 'الباقات المفعلة', value: '4 باقات' },
            { label: 'المجموعات النشطة', value: '14 مجموعة' },
            { label: 'الطلاب المسجلون', value: '142 طالباً' },
          ],
        });
        break;

      case 'classrooms':
        this.meta.set({
          title: 'إدارة الفصول والمجموعات',
          subtitle: 'متابعة الفصول الأكاديمية، كود الانضمام ورابط البث المباشر.',
          badge: 'قيد التطوير 🏫',
          icon: 'classrooms',
          mockStats: [
            { label: 'الفصول الدراسية', value: '6 فصول' },
            { label: 'كود الانضمام', value: 'نشط' },
            { label: 'المدرس المساعد', value: 'أ. أحمد' },
          ],
        });
        break;

      case 'students':
        this.meta.set({
          title: 'شؤون الطلاب وقوائم المتابعة',
          subtitle: 'قوائم الطلاب المسجلين، حالة الحضور، وتقارير التواصل مع أولياء الأمور.',
          badge: 'نسخة أولية 👨‍🎓',
          icon: 'students',
          mockStats: [
            { label: 'إجمالي الطلاب', value: '142 طالباً' },
            { label: 'نسبة التفاعل', value: '88%' },
            { label: 'طلاب يحتاجون متابعة', value: '4 طلاب' },
          ],
        });
        break;

      case 'exams':
        this.meta.set({
          title: 'مركز الامتحانات وبنك الأسئلة',
          subtitle: 'إنشاء الاختبارات الذكية، بنك الأسئلة الآلي والتصحيح التلقائي للأوراق.',
          badge: 'متاح قريباً 📝',
          icon: 'exams',
          mockStats: [
            { label: 'الامتحانات المتاحة', value: '8 امتحانات' },
            { label: 'أسئلة بنك الذكاء', value: '1,250 سؤال' },
            { label: 'التسليمات المعلقة', value: '18 تسليماً' },
          ],
        });
        break;

      case 'channel':
        this.meta.set({
          title: 'قناة الإعلانات والتواصل البثي',
          subtitle: 'نشر التنبيهات المباشرة، المذكرات السريعة وإعلانات المواعيد.',
          badge: 'مباشر 📢',
          icon: 'channel',
          mockStats: [
            { label: 'المشتركون بالقناة', value: '142 طالباً' },
            { label: 'الرسائل المرسلة', value: '34 إعلاناً' },
          ],
        });
        break;

      case 'feedback':
        this.meta.set({
          title: 'آراء وملاحظات الطلاب',
          subtitle: 'استطلاعات الرأي الأكاديمية، تقييم المحاضرات واقتراحات الطلاب.',
          badge: 'استطلاعات 💬',
          icon: 'feedback',
          mockStats: [
            { label: 'التقييم العام', value: '4.9 ⭐' },
            { label: 'الملاحظات المكتوبة', value: '28 رأياً' },
          ],
        });
        break;

      case 'analytics':
        this.meta.set({
          title: 'التحليلات البيانية للأكاديمية',
          subtitle: 'رسوم بيانية متقدمة، متوسطات الدرجات وتقارير السلاسل الزمنية.',
          badge: 'تحليلات ذكية 📈',
          icon: 'analytics',
          mockStats: [
            { label: 'متوسط الأداء العام', value: '81%' },
            { label: 'أعلى يوم تفاعل', value: 'الخميس' },
            { label: 'نسبة الالتزام', value: '92%' },
          ],
        });
        break;

      case 'reports':
        this.meta.set({
          title: 'تقارير أولياء الأمور وتصحيح AI',
          subtitle: 'مراجعة وتصحيح الإجابات، إرسال تقارير الأداء الآلية للأولياء.',
          badge: 'تصحيح ذكي 📊',
          icon: 'reports',
          mockStats: [
            { label: 'تقارير AI جاهزة', value: '3 تقارير' },
            { label: 'التقارير المرسلة', value: '103 تقارير' },
          ],
        });
        break;

      case 'account':
        this.meta.set({
          title: 'إعدادات حساب المعلم',
          subtitle: 'بيانات الملف الشخصي، كلمة المرور والتنبيهات المخصصة.',
          badge: 'الحساب الشخصي ⚙️',
          icon: 'account',
          mockStats: [
            { label: 'اسم المعلم', value: 'أ. محمد' },
            { label: 'حالة الحساب', value: 'موثق ✅' },
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
