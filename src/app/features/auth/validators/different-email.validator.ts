import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

export function differentEmailValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const email = group.get('email')?.value;
    const parentEmail = group.get('parentGuardianEmail')?.value;

    if (!email || !parentEmail) {
      return null;
    }

    if (email.toLowerCase() === parentEmail.toLowerCase()) {
      return {
        differentEmail: {
          messageKey: AUTH_CONSTANTS.KEYS.SAME_EMAIL_ERROR,
        },
      };
    }

    return null;
  };
}
