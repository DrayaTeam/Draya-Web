import { Directive, HostListener, Input, inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Directive({
  selector: '[appConfirmAction]',
  standalone: true,
  providers: [ConfirmationService],
})
export class ConfirmActionDirective {
  @Input('appConfirmAction') onConfirm!: () => void;
  @Input() confirmMessage = 'common.confirmActionMessage';
  @Input() confirmHeader = 'common.confirmActionTitle';

  private readonly confirmationService = inject(ConfirmationService);
  private readonly translateService = inject(TranslateService);

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.confirmationService.confirm({
      message: this.translateService.instant(this.confirmMessage),
      header: this.translateService.instant(this.confirmHeader),
      icon: 'i-pi-exclamation-triangle',
      accept: () => {
        if (this.onConfirm) {
          this.onConfirm();
        }
      },
    });
  }
}
