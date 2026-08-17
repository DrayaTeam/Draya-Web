import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchFieldValidator(sourceFieldName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const sourceControl = control.parent?.get(sourceFieldName);

    if (sourceControl && control.value !== sourceControl.value) {
      return { passwordMismatch: true };
    }

    return null;
  };
}
