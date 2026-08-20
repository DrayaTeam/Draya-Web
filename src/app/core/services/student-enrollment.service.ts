// src/app/core/services/student-enrollment.service.ts
import { Injectable } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import { TeacherProfile } from '../models/teacher.model';
import {
  ClassroomDto,
  ClassroomDtoPagedResult,
  ClassroomFeedbackItemDto,
  ClassroomFeedbackSummaryDto,
  SubmitClassroomFeedbackRequest,
} from '../models/student-courses.model';

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

export interface LessonItem {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'exam';
  duration?: string;
  fileUrl?: string;
}

export interface ChapterItem {
  id: string;
  title: string;
  lessons: LessonItem[];
}

export interface PackageDetailsView {
  id: string;
  name: string;
  teacherName: string;
  subject: string;
  price: number;
  description: string;
  features: string[];
  chapters: ChapterItem[];
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
   * Fetches package details, sections, and materials directly from API.
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
      sectionsRes: this.get<
        | {
            id?: string;
            sectionId?: string;
            title?: string;
            name?: string;
            description?: string;
            order?: number;
          }[]
        | {
            items?: {
              id?: string;
              sectionId?: string;
              title?: string;
              name?: string;
              description?: string;
              order?: number;
            }[];
          }
      >(`/classrooms/${classroomId}/sections`).pipe(catchError(() => of(null))),
    }).pipe(
      map(({ classroom, materialsRes, sectionsRes }) => {
        let rawMaterials: {
          id?: string;
          materialId?: string;
          sectionId?: string;
          title?: string;
          name?: string;
          type?: string;
          materialType?: string;
          duration?: string;
          durationText?: string;
          fileUrl?: string;
          url?: string;
          currentVersion?: { fileUrl?: string };
        }[] = [];
        if (Array.isArray(materialsRes)) {
          rawMaterials = materialsRes;
        } else if (materialsRes && 'items' in materialsRes && Array.isArray(materialsRes.items)) {
          rawMaterials = materialsRes.items;
        }

        const mapMaterialToLesson = (
          m: (typeof rawMaterials)[0],
          idx: number,
          prefix = 'les',
        ): LessonItem => {
          const rawType = (m.materialType || m.type || '').toString().toLowerCase();
          const rawTitle = (m.title || m.name || '').toString().toLowerCase();
          const isPdf =
            rawType.includes('pdf') ||
            rawType.includes('doc') ||
            rawTitle.endsWith('.pdf') ||
            rawTitle.endsWith('.doc');
          const isExam = rawType.includes('exam') || rawType.includes('quiz');
          const type: 'video' | 'pdf' | 'exam' = isPdf ? 'pdf' : isExam ? 'exam' : 'video';

          const fileUrl =
            m.currentVersion?.fileUrl ||
            m.fileUrl ||
            m.url ||
            (m.materialId
              ? `http://draya-api.runasp.net/api/v1/materials/${m.materialId}/stream`
              : '');

          const durationText =
            m.durationText || (isPdf ? 'مستند PDF' : isExam ? 'اختبار تدريبي' : 'فيديو تعليمي');

          return {
            id: m.materialId || m.id || `${prefix}_${idx + 1}`,
            title: m.title || m.name || `محاضرة ${idx + 1}`,
            type,
            duration: durationText,
            fileUrl,
          };
        };

        const teacherName = classroom?.gradeLevelName
          ? `أستاذ ${classroom.subjectName || ''}`
          : 'معلم دراية';
        const subject = classroom?.subjectName || 'المادة الدراسية';
        const name = classroom?.name || 'الباقة الدراسية';
        const price = classroom?.price || 0;

        const allLessons: LessonItem[] = rawMaterials.map((m, idx) => mapMaterialToLesson(m, idx));

        // Group into chapters by sections if available
        let rawSections: {
          id?: string;
          sectionId?: string;
          title?: string;
          name?: string;
          description?: string;
          order?: number;
          materials?: typeof rawMaterials;
        }[] = [];

        if (Array.isArray(sectionsRes)) {
          rawSections = sectionsRes;
        } else if (sectionsRes && 'items' in sectionsRes && Array.isArray(sectionsRes.items)) {
          rawSections = sectionsRes.items;
        }

        let chapters: ChapterItem[] = [];

        if (rawSections.length > 0) {
          chapters = rawSections.map((sec, sIdx) => {
            const secId = sec.id || sec.sectionId || `sec_${sIdx + 1}`;
            const secTitle = sec.title || sec.name || `الوحدة / القسم ${sIdx + 1}`;

            let secLessons: LessonItem[] = [];
            if (sec.materials && Array.isArray(sec.materials) && sec.materials.length > 0) {
              secLessons = sec.materials.map((m, mIdx) => mapMaterialToLesson(m, mIdx, secId));
            } else if (rawMaterials.some((m) => m.sectionId === secId)) {
              secLessons = rawMaterials
                .filter((m) => m.sectionId === secId)
                .map((m, mIdx) => mapMaterialToLesson(m, mIdx, secId));
            } else if (sIdx === 0) {
              // Fallback: assign remaining materials to the first section
              secLessons = allLessons;
            }

            return {
              id: secId,
              title: secTitle,
              lessons: secLessons,
            };
          });
        } else {
          chapters = [
            {
              id: 'ch_1',
              title: 'محتوى الباقة والمحاضرات',
              lessons: allLessons,
            },
          ];
        }

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
          chapters,
        };
      }),
    );
  }

  /**
   * Retrieves sections for a classroom.
   */
  getClassroomSections(
    classroomId: string,
  ): Observable<
    { id?: string; sectionId?: string; title?: string; description?: string }[] | null
  > {
    return this.get<{ id?: string; sectionId?: string; title?: string; description?: string }[]>(
      `/classrooms/${classroomId}/sections`,
    ).pipe(catchError(() => of(null)));
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
   * Sends redirectionUrl as required by the new backend architecture.
   * Returns the Paymob payment URL to redirect the student to.
   */
  checkoutClassroom(
    classroomId: string,
    redirectionUrl?: string,
  ): Observable<{ success: boolean; checkoutUrl?: string; message?: string }> {
    const defaultRedir =
      typeof window !== 'undefined'
        ? `${window.location.origin}/payment/result`
        : 'https://draya.com/payment/result';

    const body = {
      redirectionUrl: redirectionUrl || defaultRedir,
    };

    return this.post<{
      checkoutUrl?: string;
      paymentUrl?: string;
      url?: string;
      data?: { checkoutUrl?: string };
    }>(`/classrooms/${classroomId}/checkout`, body).pipe(
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
        let errorMsg =
          err?.error?.message || err?.error?.error?.message || err?.message || err?.error?.title;

        if (
          errorMsg === 'An unexpected error occurred.' ||
          err?.code === 'INTERNAL_ERROR' ||
          err?.status === 500
        ) {
          errorMsg =
            'تعذر الاتصال ببوابة Paymob من الخادم (Paymob 500 Internal Error)، يرجى مراجعة إعدادات الربط في السيرفر.';
        } else if (err?.status === 400) {
          errorMsg = 'معرف الباقة غير صالح أو البيانات غير مكتملة.';
        } else if (err?.status === 404) {
          errorMsg = 'هذه الباقة غير موجودة في قاعدة بيانات السيرفر.';
        } else if (err?.status === 401) {
          errorMsg = 'يجب تسجيل الدخول كطالب أولاً لإتمام الدفع.';
        } else if (!errorMsg) {
          errorMsg = 'فشل الاتصال بسيرفر الدفع، يرجى المحاولة مرة أخرى.';
        }

        return of({
          success: false,
          message: errorMsg,
        });
      }),
    );
  }

  /**
   * Fetches the source of truth payment status for a transaction.
   * Used for verifying enrollment and handling background webhook processing.
   */
  getPaymentStatus(transactionId: string): Observable<{
    paymentTransactionId: string;
    status: string;
    grossAmount: number;
    purpose?: string;
    classroomId?: string;
    isEnrolled: boolean;
  } | null> {
    return this.get<{
      paymentTransactionId: string;
      status: string;
      grossAmount: number;
      purpose?: string;
      classroomId?: string;
      isEnrolled: boolean;
    }>(`/payments/${transactionId}/status`).pipe(catchError(() => of(null)));
  }

  /**
   * Confirms payment transaction status with backend.
   * Automatically synchronizes the transaction when returning from Paymob.
   */
  confirmPayment(transactionId: string, isSuccess = true): Observable<boolean> {
    return this.post<unknown>(`/payments/confirm/${transactionId}?isSuccess=${isSuccess}`, {}).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  /**
   * GET /api/v1/classrooms/{classroomId}/feedback
   * Retrieves summary and reviews for a classroom.
   */
  getClassroomFeedback(
    classroomId: string,
    page = 1,
    pageSize = 10,
  ): Observable<ClassroomFeedbackSummaryDto | null> {
    return this.get<ClassroomFeedbackSummaryDto>(
      `/classrooms/${classroomId}/feedback?page=${page}&pageSize=${pageSize}`,
    ).pipe(catchError(() => of(null)));
  }

  /**
   * POST /api/v1/classrooms/{classroomId}/feedback
   * Submits a rating (1-5) and optional feedback comment.
   */
  submitClassroomFeedback(
    classroomId: string,
    req: SubmitClassroomFeedbackRequest,
  ): Observable<{ success: boolean; data?: ClassroomFeedbackItemDto; message?: string }> {
    return this.post<ClassroomFeedbackItemDto>(`/classrooms/${classroomId}/feedback`, req).pipe(
      map((res) => ({
        success: true,
        data: res,
        message: 'شكراً لك! تم إرسال تقييمك بنجاح.',
      })),
      catchError((err) =>
        of({
          success: false,
          message: err?.error?.message || err?.error?.title || 'تعذر إرسال التقييم حالياً.',
        }),
      ),
    );
  }
}
