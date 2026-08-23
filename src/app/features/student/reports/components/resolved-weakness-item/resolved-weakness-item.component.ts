// src/app/features/student/reports/components/resolved-weakness-item/resolved-weakness-item.component.ts

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StudentWeaknessItem } from '../../../../../core/models/student-weakness.model';

@Component({
  selector: 'app-resolved-weakness-item',
  standalone: true,
  imports: [],
  templateUrl: './resolved-weakness-item.component.html',
  styleUrl: './resolved-weakness-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResolvedWeaknessItemComponent {
  readonly weakness = input.required<StudentWeaknessItem>();
}
