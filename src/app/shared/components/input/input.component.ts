import { Component, Input, forwardRef, Provider } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

const INPUT_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => InputComponent),
  multi: true
};

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  providers: [INPUT_VALUE_ACCESSOR],
  template: `
    <div class="flex flex-col gap-1 w-full" [ngClass]="className">
      @if (label) {
        <label [attr.for]="id" class="text-xs font-semibold text-foreground tracking-wide">
          {{ label }}
          @if (required) {
            <span class="text-primary mr-0.5">*</span>
          }
        </label>
      }
      <div class="relative">
        @if (icon) {
          <span class="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground pointer-events-none" [class]="icon"></span>
        }
        @if (endIcon) {
          <span class="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground z-[2]" [class]="endIcon"></span>
        }
        <input
          [id]="id"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
          [ngClass]="[
            'w-full h-[42px] rounded-lg border bg-card text-foreground text-[15px] outline-none transition duration-150 box-border focus:border-draya-500 focus:ring-3 focus:ring-primary/15',
            error ? 'border-destructive' : 'border-border',
            icon ? (endIcon ? 'pr-10 pl-10' : 'pr-10 pl-3.5') : (endIcon ? 'pr-3.5 pl-10' : 'px-3.5'),
            disabled ? 'cursor-not-allowed opacity-50' : ''
          ]"
        />
      </div>
      @if (error) {
        <span class="text-xs text-destructive flex items-center gap-1 mt-0.5">
          <span class="pi pi-exclamation-triangle" style="font-size: 0.7rem;"></span>
          {{ error }}
        </span>
      }
    </div>
  `
})
export class InputComponent implements ControlValueAccessor {
  private static nextId = 0;

  @Input() id = `app-input-${InputComponent.nextId++}`;
  @Input() label?: string;
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() error?: string;
  @Input() icon?: string;
  @Input() endIcon?: string;
  @Input() required = false;
  @Input() className = '';

  value = '';
  disabled = false;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange: (value: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }

  onBlur(): void {
    this.onTouched();
  }
}
