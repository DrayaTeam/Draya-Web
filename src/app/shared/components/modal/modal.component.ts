import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, Dialog],
  template: `
    <p-dialog
      [(visible)]="isOpen"
      [header]="title || ''"
      [modal]="true"
      [style]="{ width: '100%', 'max-width': maxWidthMap[size] }"
      [draggable]="false"
      [resizable]="false"
      [closable]="true"
      (onHide)="onClose()"
      styleClass="draya-modal"
    >
      <div class="py-4 text-[15px] leading-relaxed text-foreground">
        <ng-content></ng-content>
      </div>

      @if (footerTemplate) {
        <ng-template pTemplate="footer">
          <div class="flex justify-end gap-3 pt-3 border-t border-border bg-secondary/50 rounded-b-xl">
            <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
          </div>
        </ng-template>
      }
    </p-dialog>
  `
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() footerTemplate?: TemplateRef<unknown>;

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() modalClose = new EventEmitter<void>();

  readonly maxWidthMap = {
    sm: '440px',
    md: '600px',
    lg: '800px',
  };

  onClose(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.modalClose.emit();
  }
}
