// src/app/features/teacher/components/teacher-sidebar/teacher-sidebar.component.ts
import { Component, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../auth';

export interface NavGroup {
  headerKey: string;
  items: NavItem[];
}

export interface NavItem {
  labelKey: string;
  link: string;
  icon:
    | 'dashboard'
    | 'packages'
    | 'classrooms'
    | 'students'
    | 'exams'
    | 'channel'
    | 'feedback'
    | 'analytics'
    | 'reports'
    | 'subscription'
    | 'wallet'
    | 'account';
  exact?: boolean;
}

@Component({
  selector: 'draya-teacher-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './teacher-sidebar.component.html',
  styleUrl: './teacher-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherSidebarComponent {
  protected readonly auth = inject(AuthService);

  readonly isOpenMobile = input<boolean>(false);
  readonly closeMobile = output<void>();

  readonly navGroups: NavGroup[] = [
    {
      headerKey: 'TEACHER.SIDEBAR.GROUP_TEACHING',
      items: [
        {
          labelKey: 'TEACHER.SIDEBAR.DASHBOARD',
          link: '/teacher/dashboard',
          icon: 'dashboard',
          exact: true,
        },
        {
          labelKey: 'TEACHER.SIDEBAR.PACKAGES',
          link: '/teacher/packages',
          icon: 'packages',
        },
        {
          labelKey: 'TEACHER.SIDEBAR.CLASSROOMS',
          link: '/teacher/classrooms',
          icon: 'classrooms',
        },
      ],
    },
    {
      headerKey: 'TEACHER.SIDEBAR.GROUP_EVALUATION',
      items: [
        {
          labelKey: 'TEACHER.SIDEBAR.STUDENTS',
          link: '/teacher/students',
          icon: 'students',
        },
        {
          labelKey: 'TEACHER.SIDEBAR.EXAMS',
          link: '/teacher/exams',
          icon: 'exams',
        },
      ],
    },
    {
      headerKey: 'TEACHER.SIDEBAR.GROUP_COMMUNICATION',
      items: [
        {
          labelKey: 'TEACHER.SIDEBAR.CHANNEL',
          link: '/teacher/channel',
          icon: 'channel',
        },
        {
          labelKey: 'TEACHER.SIDEBAR.FEEDBACK',
          link: '/teacher/feedback',
          icon: 'feedback',
        },
      ],
    },
    {
      headerKey: 'TEACHER.SIDEBAR.GROUP_ANALYTICS',
      items: [
        {
          labelKey: 'TEACHER.SIDEBAR.ANALYTICS',
          link: '/teacher/analytics',
          icon: 'analytics',
        },
        {
          labelKey: 'TEACHER.SIDEBAR.REPORTS',
          link: '/teacher/reports',
          icon: 'reports',
        },
      ],
    },
  ];

  readonly footerNavItems: NavItem[] = [
    {
      labelKey: 'المحفظة المالية', // TODO: Add to i18n
      link: '/teacher/wallet',
      icon: 'wallet',
    },
    {
      labelKey: 'TEACHER.SIDEBAR.SUBSCRIPTION',
      link: '/teacher/subscription',
      icon: 'subscription',
    },
    {
      labelKey: 'TEACHER.SIDEBAR.ACCOUNT',
      link: '/teacher/account',
      icon: 'account',
    },
  ];

  handleLinkClick(): void {
    this.closeMobile.emit();
  }

  handleLogout(): void {
    this.closeMobile.emit();
    this.auth.logout();
  }
}
