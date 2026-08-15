// src/app/features/teacher/classrooms/teacher-classrooms.component.ts
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { CreateClassroomModalComponent } from './components/create-classroom-modal/create-classroom-modal.component';

@Component({
  selector: 'draya-teacher-classrooms',
  standalone: true,
  imports: [
    CommonModule, 
    TranslatePipe,
    CreateClassroomModalComponent
  ],
  templateUrl: './teacher-classrooms.component.html',
  styleUrl: './teacher-classrooms.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' }
})
export class TeacherClassroomsComponent {
  readonly isCreateModalOpen = signal<boolean>(false);

  openCreateModal(): void {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }
}
