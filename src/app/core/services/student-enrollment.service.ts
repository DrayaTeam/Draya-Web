// src/app/core/services/student-enrollment.service.ts
import { Injectable } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import { TeacherProfile } from '../models/teacher.model';
import { ClassroomDto, ClassroomDtoPagedResult } from '../models/student-courses.model';

export interface ClassroomMaterialDto {
  materialId: string;
  title: string;
  type: string;
  durationText?: string;
  fileUrl?: string;
  version?: number;
}

export interface TeacherDetailsView {
  id: string;
  name: string;
  subject: string;
  rating: number;
  studentsCount: number;
  bio: string;
  avatarUrl: string;
  packages: TeacherPackageCard[];
}

export interface TeacherPackageCard {
  id: string;
  name: string;
  chaptersCount: number;
  lessonsCount: number;
  price: number;
  rating: number;
  subjectName: string;
}

export interface PackageDetailsView {
  id: string;
  name: string;
  teacherName: string;
  subject: string;
  price: number;
  description: string;
  features: string[];
  chapters: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      type: 'video' | 'pdf' | 'exam';
      duration?: string;
    }[];
  }[];
}

@Injectable({ providedIn: 'root' })
export class StudentEnrollmentService extends ApiBaseService {
  /**
   * Fetches the student's enrolled classrooms list.
   */
  getEnrolledClassrooms(): Observable<ClassroomDtoPagedResult | null> {
    return this.get<ClassroomDtoPagedResult>('/classrooms').pipe(catchError(() => of(null)));
  }

  /**
   * Fetches teacher profile and their list of real classrooms directly from API.
   */
  getTeacherDetails(teacherId: string): Observable<TeacherDetailsView> {
    return forkJoin({
      profile: this.get<TeacherProfile>(`/teachers/${teacherId}`).pipe(catchError(() => of(null))),
      classroomsRes: this.get<ClassroomDtoPagedResult | ClassroomDto[]>(
        `/teachers/${teacherId}/classrooms`,
      ).pipe(catchError(() => of(null))),
    }).pipe(
      map(({ profile, classroomsRes }) => {
        let classroomList: ClassroomDto[] = [];
        if (Array.isArray(classroomsRes)) {
          classroomList = classroomsRes;
        } else if (
          classroomsRes &&
          'items' in classroomsRes &&
          Array.isArray(classroomsRes.items)
        ) {
          classroomList = classroomsRes.items;
        }

        const name = profile?.fullName ? `أ. ${profile.fullName}` : 'معلم دراية';
        const subject = profile?.specialization || 'المادة الدراسية';
        const bio =
          profile?.description ||
          (profile?.specialization
            ? `معلم متخصص في مادة ${profile.specialization} على منصة دراية.`
            : 'معلم معتمد في منصة دراية التعليمية.');
        const avatarUrl =
          'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop';
        const rating = 5.0;
        const studentsCount = classroomList.reduce((acc, c) => acc + (c.studentCount || 0), 0);

        const pkgs: TeacherPackageCard[] = classroomList.map((c) => ({
          id: c.classroomId,
          name: c.name || `باقة ${c.subjectName || subject}`,
          chaptersCount: 1,
          lessonsCount: 1,
          price: c.price || 0,
          rating: 5.0,
          subjectName: c.subjectName || subject,
        }));

        return {
          id: teacherId,
          name,
          subject,
          rating,
          studentsCount,
          bio,
          avatarUrl,
          packages: pkgs,
        };
      }),
    );
  }

  /**
   * Fetches package details and materials directly from API.
   */
  getPackageDetails(classroomId: string): Observable<PackageDetailsView> {
    return forkJoin({
      classroom: this.get<ClassroomDto>(`/classrooms/${classroomId}`).pipe(
        catchError(() => of(null)),
      ),
      materialsRes: this.get<
        | ClassroomDtoPagedResult
        | {
            items?: {
              id?: string;
              title?: string;
              name?: string;
              type?: string;
              duration?: string;
            }[];
          }
        | { id?: string; title?: string; name?: string; type?: string; duration?: string }[]
      >(`/classrooms/${classroomId}/materials`).pipe(catchError(() => of(null))),
    }).pipe(
      map(({ classroom, materialsRes }) => {
        let rawMaterials: {
          id?: string;
          materialId?: string;
          title?: string;
          name?: string;
          type?: string;
          materialType?: string;
          duration?: string;
          durationText?: string;
        }[] = [];
        if (Array.isArray(materialsRes)) {
          rawMaterials = materialsRes;
        } else if (materialsRes && 'items' in materialsRes && Array.isArray(materialsRes.items)) {
          rawMaterials = materialsRes.items;
        }

        const teacherName = classroom?.gradeLevelName
          ? `أستاذ ${classroom.subjectName || ''}`
          : 'معلم دراية';
        const subject = classroom?.subjectName || 'المادة الدراسية';
        const name = classroom?.name || 'الباقة الدراسية';
        const price = classroom?.price || 0;

        const lessonsList = rawMaterials.map((m, idx) => ({
          id: m.materialId || m.id || `les_${idx + 1}`,
          title: m.title || `محاضرة ${idx + 1}`,
          type: (m.type === 'pdf' || m.materialType === 'pdf'
            ? 'pdf'
            : m.type === 'exam' || m.materialType === 'exam'
              ? 'exam'
              : 'video') as 'video' | 'pdf' | 'exam',
          duration: m.durationText || '25 دقيقة',
        }));

        return {
          id: classroomId,
          name,
          teacherName,
          subject,
          price,
          description: `باقة دراسية في مادة ${subject} تشمل المحاضرات والمذكرات والاختبارات الدورية.`,
          features: [
            'محاضرات وفيديوهات مسجلة بجودة عالية ومحمية',
            'مذكرات وملخصات PDF جاهزة للمعاينة والتحميل',
            'امتحانات تدريبية دورية مع تصحيح فوري',
            'قناة نقاش تفاعلية للأسئلة مع المدرس',
          ],
          chapters: [
            {
              id: 'ch_1',
              title: 'محتوى الباقة والمحاضرات',
              lessons: lessonsList,
            },
          ],
        };
      }),
    );
  }

  /**
   * Enrolls student with paper activation code.
   */
  enrollWithCode(enrollmentCode: string): Observable<{ success: boolean; message: string }> {
    return this.post<{ success?: boolean; message?: string }>('/classrooms/enroll', {
      enrollmentCode: enrollmentCode.trim(),
    }).pipe(
      map(() => ({
        success: true,
        message: 'تم تفعيل الباقة بنجاح! مرحباً بك في المجموعة الدراسية.',
      })),
      catchError((err) => {
        return of({
          success: false,
          message:
            err?.error?.message ||
            err?.error?.title ||
            'كود التفعيل غير صالح أو تم استخدامه مسبقاً.',
        });
      }),
    );
  }

  /**
   * Initiates Paymob checkout session for a classroom.
   * Returns the Paymob payment URL to redirect the student to.
   */
  checkoutClassroom(
    classroomId: string,
  ): Observable<{ success: boolean; checkoutUrl?: string; message?: string }> {
    return this.post<{
      checkoutUrl?: string;
      paymentUrl?: string;
      url?: string;
      data?: { checkoutUrl?: string };
    }>(`/classrooms/${classroomId}/checkout`, {}).pipe(
      map((res) => {
        const url =
          res?.checkoutUrl ||
          res?.paymentUrl ||
          res?.url ||
          res?.data?.checkoutUrl ||
          (typeof res === 'string' ? res : undefined);

        if (url) {
          return { success: true, checkoutUrl: url };
        }
        return {
          success: false,
          message: 'استجاب السيرفر ولكن لم يُرجع رابط Paymob (checkoutUrl).',
        };
      }),
      catchError((err) => {
        const errorMsg =
          err?.error?.message ||
          err?.error?.title ||
          (err?.status === 400
            ? 'معرف الباقة غير صالح (يجب أن يكون UUID حقيقي من السيرفر).'
            : null) ||
          (err?.status === 404 ? 'هذه الباقة غير موجودة في قاعدة بيانات السيرفر.' : null) ||
          (err?.status === 401 ? 'يجب تسجيل الدخول كطالب أولاً لإتمام الدفع.' : null) ||
          'فشل الاتصال بسيرفر الدفع، يرجى المحاولة مرة أخرى.';

        return of({
          success: false,
          message: errorMsg,
        });
      }),
    );
  }
}
