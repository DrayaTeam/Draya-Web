import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  private readonly auth = inject(AuthService);

  readonly loading = this.auth.isLoading;
  readonly error = this.auth.authError;
  readonly user = this.auth.currentUser;

  ngOnInit(): void {
    if (!this.user()) {
      this.auth.getProfile().subscribe();
    }
  }

  retry(): void {
    this.auth.getProfile().subscribe();
  }
}
