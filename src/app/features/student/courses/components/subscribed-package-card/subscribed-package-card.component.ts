// src/app/features/student/courses/components/subscribed-package-card/subscribed-package-card.component.ts
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { SubscribedPackage } from '../../../../../core/models/student-courses.model';

@Component({
  selector: 'draya-subscribed-package-card',
  standalone: true,
  imports: [],
  templateUrl: './subscribed-package-card.component.html',
  styleUrl: './subscribed-package-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscribedPackageCardComponent {
  readonly package = input.required<SubscribedPackage>();
  readonly openPackageDetails = output<SubscribedPackage>();

  readonly defaultBanner = 'assets/images/default-classroom.svg';

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && !target.src.includes('default-classroom.svg')) {
      target.src = this.defaultBanner;
    }
  }

  onActionClick(): void {
    this.openPackageDetails.emit(this.package());
  }
}
