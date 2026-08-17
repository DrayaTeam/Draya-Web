import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ClassroomService } from '../../services/classroom.service';
import { ClassroomStudentsComponent } from './components/classroom-students/classroom-students.component';
import { ClassroomMaterialsComponent } from './components/classroom-materials/classroom-materials.component';
import { ClassroomQaComponent } from './components/classroom-qa/classroom-qa.component';
import { EditClassroomModalComponent } from '../components/edit-classroom-modal/edit-classroom-modal.component';

@Component({
  selector: 'draya-classroom-detail',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    ConfirmDialogModule,
    ClassroomStudentsComponent,
    ClassroomMaterialsComponent,
    ClassroomQaComponent,
    EditClassroomModalComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './classroom-detail.component.html',
  styleUrl: './classroom-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassroomDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly classroomService = inject(ClassroomService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService, { optional: true });

  readonly classroom = this.classroomService.activeClassroom;
  readonly currentRosterTotalCount = this.classroomService.currentRosterTotalCount;
  readonly isLoading = this.classroomService.isLoading;
  readonly hasError = signal<boolean>(false);
  readonly isEditModalOpen = signal<boolean>(false);
  readonly activeTab = signal<number>(0);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.classroomService.getClassroomById(id).subscribe({
        error: () => {
          this.hasError.set(true);
        },
      });
    } else {
      this.hasError.set(true);
    }
  }

  loadClassroom(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.classroomService.getClassroomById(id).subscribe();
    }
  }

  confirmDeactivateClassroom(): void {
    const current = this.classroom();
    if (!current) return;

    this.confirmationService.confirm({
      message: 'سيتم إخفاء الفصل عن الطلاب الجدد، لكنه سيبقى في قائمتك. هل تريد الاستمرار؟',
      header: 'تعطيل الفصل',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، قم بالتعطيل',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.deactivateClassroom(current.classroomId);
      },
    });
  }

  private deactivateClassroom(id: string): void {
    this.classroomService.deactivateClassroom(id).subscribe({
      next: () => {
        this.messageService?.add({
          severity: 'success',
          summary: 'تم التعطيل',
          detail: 'تم تعطيل الفصل الدراسي بنجاح.',
        });
        this.router.navigate(['/teacher/classrooms']);
      },
      error: (err) => {
        console.error('Failed to deactivate classroom', err);
        this.messageService?.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'حدث خطأ أثناء تعطيل الفصل.',
        });
      },
    });
  }

  confirmRegenerateCode(): void {
    const current = this.classroom();
    if (!current) return;

    this.confirmationService.confirm({
      message: 'إنشاء كود جديد سيُبطل الكود القديم فوراً، ولن يتمكن الطلاب الجدد من استخدامه. هل أنت متأكد؟',
      header: 'إنشاء كود تسجيل جديد',
      icon: 'pi pi-info-circle',
      acceptLabel: 'نعم، إنشاء كود جديد',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.regenerateCode(current.classroomId);
      },
    });
  }

  private regenerateCode(id: string): void {
    this.classroomService.regenerateEnrollmentCode(id).subscribe({
      next: (dto) => {
        this.messageService?.add({
          severity: 'success',
          summary: 'تم إنشاء الكود',
          detail: 'تم إنشاء كود تسجيل جديد بنجاح.',
        });
        this.classroomService.setActiveClassroom(dto);
      },
      error: (err) => {
        console.error('Failed to regenerate code', err);
        this.messageService?.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'حدث خطأ أثناء إنشاء كود جديد.',
        });
      },
    });
  }
}
