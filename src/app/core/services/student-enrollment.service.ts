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
  durationMinutes?: number;
  fileUrl?: string;
  startDate?: string;
  endDate?: string | null;
  allowedAttempts?: number;
  isAvailable?: boolean;
}

export interface SectionItemDto {
  id?: string;
  sectionId?: string;
  title?: string;
  name?: string;
  description?: string;
  order?: number;
  materials?: {
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
  }[];
  documents?: {
    id?: string;
    title?: string;
    name?: string;
    materialType?: string;
    fileUrl?: string;
    url?: string;
    createdAt?: string;
  }[];
  videos?: {
    id?: string;
    title?: string;
    name?: string;
    materialType?: string;
    fileUrl?: string;
    url?: string;
    duration?: string;
    durationText?: string;
    createdAt?: string;
  }[];
  exams?: {
    id?: string;
    title?: string;
    topic?: string;
    durationMinutes?: number;
    allowedAttempts?: number;
    questionsCount?: number;
    startDate?: string;
    startsAt?: string;
    scheduledAt?: string;
    availableFrom?: string;
    endDate?: string | null;
    endsAt?: string;
    availableTo?: string;
    createdAt?: string;
  }[];
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

        const name = profile?.fullName ? `أ. ${profile.fullName}` : 'معلم المادة';
        const subject = profile?.specialization || 'المادة الدراسية';
        const bio =
          profile?.description ||
          (profile?.specialization
            ? `معلم متخصص في مادة ${profile.specialization}.`
            : 'معلم معتمد في المنصة التعليمية.');
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
      sectionsRes: this.get<SectionItemDto[] | { items?: SectionItemDto[] }>(
        `/classrooms/${classroomId}/sections`,
      ).pipe(catchError(() => of(null))),
      examsRes: this.get<
        | {
            items?: {
              id?: string;
              examId?: string;
              sectionId?: string;
              title?: string;
              topic?: string;
              durationMinutes?: number;
              allowedAttempts?: number;
              questionsCount?: number;
              questions?: unknown[];
              startDate?: string;
              endDate?: string;
            }[];
          }
        | {
            id?: string;
            examId?: string;
            sectionId?: string;
            title?: string;
            topic?: string;
            durationMinutes?: number;
            allowedAttempts?: number;
            questionsCount?: number;
            questions?: unknown[];
            startDate?: string;
            endDate?: string;
          }[]
      >('/students/exams', { page: 1, pageSize: 50 }).pipe(
        map((res) => (Array.isArray(res) ? res : res?.items || [])),
        catchError(() => of([])),
      ),
    }).pipe(
      map(({ classroom, materialsRes, sectionsRes, examsRes }) => {
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

        let rawExams: {
          id?: string;
          examId?: string;
          sectionId?: string;
          title?: string;
          topic?: string;
          durationMinutes?: number;
          allowedAttempts?: number;
          questionsCount?: number;
          questions?: unknown[];
          startDate?: string;
          endDate?: string;
        }[] = [];
        if (Array.isArray(examsRes)) {
          rawExams = examsRes;
        } else if (
          examsRes &&
          typeof examsRes === 'object' &&
          'items' in examsRes &&
          Array.isArray((examsRes as { items: unknown[] }).items)
        ) {
          rawExams = (examsRes as { items: typeof rawExams }).items;
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
              ? `/api/v1/materials/${m.materialId}/stream`
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

        const mapExamToLesson = (
          e: (typeof rawExams)[0] & {
            questionsCount?: number;
            durationMinutes?: number;
            allowedAttempts?: number;
            startDate?: string;
            startsAt?: string;
            scheduledAt?: string;
            availableFrom?: string;
            endDate?: string | null;
            endsAt?: string;
            availableTo?: string;
          },
          idx: number,
          prefix = 'exam',
        ): LessonItem => {
          const examId = e.examId || e.id || `${prefix}_${idx + 1}`;
          const examTitle =
            e.title || (e.topic ? `اختبار: ${e.topic}` : `امتحان إلكتروني ${idx + 1}`);
          const qCount = e.questionsCount || e.questions?.length;
          const durMin = e.durationMinutes;
          const durationParts: string[] = [];
          if (qCount) durationParts.push(`${qCount} أسئلة`);
          if (durMin) durationParts.push(`${durMin} دقيقة`);
          const durationText =
            durationParts.length > 0
              ? `${durationParts.join(' · ')} · اختبار إلكتروني`
              : 'اختبار إلكتروني تفاعلي';

          const start = e.startDate || e.startsAt || e.scheduledAt || e.availableFrom;
          const end = e.endDate || e.endsAt || e.availableTo;
          const now = new Date();
          const isUpcoming = start ? new Date(start) > now : false;
          const isExpired = end ? new Date(end) < now : false;
          const isAvailable = !isUpcoming && !isExpired;

          return {
            id: examId,
            title: examTitle,
            type: 'exam',
            duration: durationText,
            durationMinutes: durMin,
            allowedAttempts: e.allowedAttempts,
            fileUrl: `/student/exams/${examId}/take`,
            startDate: start,
            endDate: end,
            isAvailable,
          };
        };

        const teacherName =
          classroom?.teacherName ||
          (classroom?.subjectName ? `أستاذ ${classroom.subjectName}` : '');
        const subject = classroom?.subjectName || 'المادة الدراسية';
        const name = classroom?.name || 'فصل دراسي';
        const price = classroom?.price ?? 0;

        const allLessons: LessonItem[] = rawMaterials.map((m, idx) => mapMaterialToLesson(m, idx));

        // Group into chapters by sections if available
        let rawSections: SectionItemDto[] = [];

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

            // 1. Embedded documents (PDFs)
            const embeddedDocs: LessonItem[] = (sec.documents || []).map((doc, dIdx) => ({
              id: doc.id || `doc_${secId}_${dIdx + 1}`,
              title: doc.title || doc.name || `مستند ${dIdx + 1}`,
              type: 'pdf',
              duration: 'مستند PDF',
              fileUrl: doc.fileUrl || doc.url || '',
            }));

            // 2. Embedded videos
            const embeddedVideos: LessonItem[] = (sec.videos || []).map((vid, vIdx) => ({
              id: vid.id || `vid_${secId}_${vIdx + 1}`,
              title: vid.title || vid.name || `فيديو ${vIdx + 1}`,
              type: 'video',
              duration: vid.durationText || vid.duration || 'فيديو تعليمي',
              fileUrl: vid.fileUrl || vid.url || '',
            }));

            // 3. Embedded exams
            const embeddedExams: LessonItem[] = (sec.exams || []).map((ex, eIdx) => {
              const exAny = ex as Record<string, string | undefined>;
              const start =
                exAny['startDate'] ||
                exAny['startsAt'] ||
                exAny['scheduledAt'] ||
                exAny['availableFrom'];
              const end = exAny['endDate'] || exAny['endsAt'] || exAny['availableTo'];
              return {
                id: ex.id || `exam_${secId}_${eIdx + 1}`,
                title:
                  ex.title || (ex.topic ? `اختبار: ${ex.topic}` : `امتحان إلكتروني ${eIdx + 1}`),
                type: 'exam',
                duration: ex.questionsCount
                  ? `${ex.questionsCount} أسئلة · اختبار إلكتروني`
                  : 'اختبار إلكتروني',
                fileUrl: ex.id ? `/student/exams/${ex.id}/take` : '/student/exams',
                startDate: start,
                endDate: end,
                isAvailable: !start || new Date(start) <= new Date(),
              };
            });

            // 4. Standalone materials from /materials endpoint
            let secMaterials: LessonItem[] = [];
            if (sec.materials && Array.isArray(sec.materials) && sec.materials.length > 0) {
              secMaterials = sec.materials.map((m, mIdx) => mapMaterialToLesson(m, mIdx, secId));
            } else if (rawMaterials.some((m) => m.sectionId === secId)) {
              secMaterials = rawMaterials
                .filter((m) => m.sectionId === secId)
                .map((m, mIdx) => mapMaterialToLesson(m, mIdx, secId));
            } else if (
              sIdx === 0 &&
              !rawMaterials.some((m) => !!m.sectionId) &&
              embeddedDocs.length === 0 &&
              embeddedVideos.length === 0
            ) {
              secMaterials = allLessons;
            }

            // 5. Standalone exams from /exams endpoint
            let standaloneExams: LessonItem[] = [];
            if (rawExams.some((e) => e.sectionId === secId)) {
              standaloneExams = rawExams
                .filter((e) => e.sectionId === secId)
                .map((e, eIdx) => mapExamToLesson(e, eIdx, secId));
            } else if (
              sIdx === 0 &&
              !rawExams.some((e) => !!e.sectionId) &&
              embeddedExams.length === 0
            ) {
              standaloneExams = rawExams.map((e, eIdx) => mapExamToLesson(e, eIdx, secId));
            }

            // Combine all without duplicating IDs
            const seenIds = new Set<string>();
            const secLessons: LessonItem[] = [];

            for (const item of [
              ...embeddedVideos,
              ...embeddedDocs,
              ...embeddedExams,
              ...secMaterials,
              ...standaloneExams,
            ]) {
              if (item.id && !seenIds.has(item.id)) {
                seenIds.add(item.id);
                secLessons.push(item);
              } else if (!item.id) {
                secLessons.push(item);
              }
            }

            return {
              id: secId,
              title: secTitle,
              lessons: secLessons,
            };
          });
        } else {
          const allExams: LessonItem[] = rawExams.map((e, idx) => mapExamToLesson(e, idx));
          chapters = [
            {
              id: 'ch_1',
              title: 'محتوى الباقة والمحاضرات',
              lessons: [...allLessons, ...allExams],
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
    return this.http
      .get<{ id?: string; sectionId?: string; title?: string; description?: string }[]>(
        `/api/classrooms/${classroomId}/sections`,
      )
      .pipe(catchError(() => of(null)));
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
    return this.get<ClassroomFeedbackSummaryDto>(`/classrooms/${classroomId}/feedback`, {
      page,
      pageNumber: page,
      pageSize,
    }).pipe(catchError(() => of(null)));
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
      catchError((err) => {
        let errorMsg = 'تعذر إرسال التقييم إلى السيرفر حالياً.';
        if (err?.status === 500) {
          errorMsg = 'خطأ في سيرفر التقييمات (500) — جارٍ معالجة التقييم أو يتطلب تحديث الباك إند.';
        } else if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.error?.title) {
          errorMsg = err.error.title;
        }
        return of({
          success: false,
          message: errorMsg,
        });
      }),
    );
  }
}
