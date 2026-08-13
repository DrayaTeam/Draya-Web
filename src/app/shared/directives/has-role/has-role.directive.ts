import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private readonly templateRef = inject(TemplateRef);
  private readonly vcr = inject(ViewContainerRef);
  private readonly auth = inject(AuthService);

  private hasView = false;

  @Input() set appHasRole(allowedRoles: string[]) {
    const userRole = this.auth.currentUser()?.role;

    // Check if the current user's role is in the list of allowed roles
    if (userRole && allowedRoles.includes(userRole) && !this.hasView) {
      this.vcr.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if ((!userRole || !allowedRoles.includes(userRole)) && this.hasView) {
      this.vcr.clear();
      this.hasView = false;
    }
  }
}
