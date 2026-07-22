import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert-message',
  standalone: true,
  template: `
    <div [class]="'flex items-start gap-3 rounded-md p-4 text-sm ' + typeClasses[type]">
      <span [class]="iconClasses[type] + ' h-5 w-5 shrink-0 mt-0.5'"></span>
      <div>
        @if (title) {
          <h4 class="font-semibold">{{ title }}</h4>
        }
        <p [class]="title ? 'mt-1' : ''">{{ message }}</p>
      </div>
    </div>
  `
})
export class AlertMessageComponent {
  @Input({ required: true }) message!: string;
  @Input() title?: string;
  @Input() type: 'info' | 'success' | 'warning' | 'error' = 'info';

  protected typeClasses = {
    info: 'bg-blue-50 text-blue-900 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-200 dark:border-blue-900',
    success: 'bg-green-50 text-green-900 border border-green-200 dark:bg-green-950/50 dark:text-green-200 dark:border-green-900',
    warning: 'bg-yellow-50 text-yellow-900 border border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-200 dark:border-yellow-900',
    error: 'bg-red-50 text-red-900 border border-red-200 dark:bg-red-950/50 dark:text-red-200 dark:border-red-900'
  };

  protected iconClasses = {
    info: 'i-pi-info-circle',
    success: 'i-pi-check-circle',
    warning: 'i-pi-exclamation-triangle',
    error: 'i-pi-times-circle'
  };
}
