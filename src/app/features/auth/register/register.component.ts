import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'draya-register',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  readonly selectedRole = signal<'student' | 'teacher' | 'parent'>('student');

  setRole(role: 'student' | 'teacher' | 'parent'): void {
    this.selectedRole.set(role);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    // Stub for registration integration
  }
}
