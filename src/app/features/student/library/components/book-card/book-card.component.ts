// src/app/features/student/library/components/book-card/book-card.component.ts

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryBookItem } from '../../../../../core/models/student-library.model';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookCardComponent {
  readonly book = input.required<LibraryBookItem>();
  readonly preview = output<LibraryBookItem>();
  readonly download = output<LibraryBookItem>();
}
