import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  signal,
  computed,
  effect,
  untracked,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TeacherExamService } from '../../../../services/teacher-exam.service';
import { TeacherExamDto } from '../../../../../../core/models/teacher-exam.model';
import { SectionService } from '../../../../services/section.service';
import { ClassroomSectionDto } from '../../../../../../core/models/section.model';

@Component({
  selector: 'draya-classroom-exams',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './classroom-exams.component.html',
  styleUrl: './classroom-exams.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassroomExamsComponent {
  private readonly examService = inject(TeacherExamService);
  private readonly sectionService = inject(SectionService);

  readonly classroomId = input.required<string>();

  readonly exams = signal<TeacherExamDto[]>([]);
  readonly sections = signal<ClassroomSectionDto[]>([]);
  readonly selectedSectionId = signal<string | null>(null);

  readonly isLoading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  readonly filteredExams = computed(() => {
    const sectionId = this.selectedSectionId();
    const allExams = this.exams();
    if (!sectionId) return allExams;

    const activeSection = this.sections().find((s) => s.id === sectionId);

    return allExams.filter((e) => {
      if (e.sectionId === sectionId) return true;
      if (!e.sectionId && activeSection && e.topic) {
        const topicLower = e.topic.toLowerCase();
        const sectionTitleLower = activeSection.title.toLowerCase();
        if (topicLower.includes(sectionTitleLower) || sectionTitleLower.includes(topicLower))
          return true;
      }
      return false;
    });
  });

  constructor() {
    effect(() => {
      const id = this.classroomId();
      if (id) {
        untracked(() => {
          this.selectedSectionId.set(null);
          this.loadData();
        });
      }
    });
  }

  loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      examsRes: this.examService.getExams(this.classroomId()).pipe(catchError(() => of(null))),
      sectionsRes: this.sectionService
        .getSections(this.classroomId())
        .pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ examsRes, sectionsRes }) => {
        const sections = sectionsRes || [];
        this.sections.set(sections);

        let extractedExams: TeacherExamDto[] = [];
        if (Array.isArray(examsRes)) extractedExams = examsRes;
        else if (examsRes && Array.isArray(examsRes.items)) extractedExams = examsRes.items;
        else if (examsRes && Array.isArray(examsRes.data)) extractedExams = examsRes.data;
        else if (examsRes && Array.isArray(examsRes.exams)) extractedExams = examsRes.exams;

        // Backfill sectionId
        sections.forEach((s) => {
          if (s.exams && Array.isArray(s.exams)) {
            s.exams.forEach((sectionExam) => {
              const examObj = sectionExam as { id?: string; examId?: string } | string;
              const examId = typeof examObj === 'string' ? examObj : examObj.id || examObj.examId;
              const match = extractedExams.find((e) => e.id === examId);
              if (match) match.sectionId = s.id;
            });
          }
        });

        this.exams.set(extractedExams);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('حدث خطأ أثناء تحميل البيانات');
        this.isLoading.set(false);
      },
    });
  }

  selectSection(id: string | null): void {
    this.selectedSectionId.set(id);
  }
}
