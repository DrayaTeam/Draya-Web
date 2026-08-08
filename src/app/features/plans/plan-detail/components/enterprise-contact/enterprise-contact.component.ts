// src/app/features/plans/plan-detail/components/enterprise-contact/enterprise-contact.component.ts
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LogoComponent } from '../../../../../shared/components/logo/logo.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'draya-enterprise-contact',
  standalone: true,
  imports: [RouterLink, LogoComponent, FormsModule],
  templateUrl: './enterprise-contact.component.html',
  styleUrl: './enterprise-contact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class EnterpriseContactComponent {
  readonly institutionName = signal<string>('');
  readonly contactPerson = signal<string>('');
  readonly phone = signal<string>('');
  readonly email = signal<string>('');
  readonly studentCount = signal<string>('500-2000');
  readonly notes = signal<string>('');

  readonly isSubmitting = signal<boolean>(false);
  readonly submitSuccess = signal<boolean>(false);

  readonly studentCountOptions = [
    { label: 'أقل من 500 طالب', val: '<500' },
    { label: '500 - 2,000 طالب', val: '500-2000' },
    { label: '2,000 - 5,000 طالب', val: '2000-5000' },
    { label: 'أكثر من 5,000 طالب', val: '>5000' },
  ];

  onSubmit(): void {
    if (!this.phone() || !this.institutionName()) {
      return;
    }
    this.isSubmitting.set(true);

    setTimeout(() => {
      this.isSubmitting.set(false);
      this.submitSuccess.set(true);
    }, 1000);
  }
}
