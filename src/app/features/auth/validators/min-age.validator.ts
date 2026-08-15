import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

export function minAgeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const dob = new Date(value);

    if (isNaN(dob.getTime())) {
      return { minAge: { messageKey: AUTH_CONSTANTS.KEYS.INVALID_DATE } };
    }

    const today = new Date();

    if (dob > today) {
      return { minAge: { messageKey: AUTH_CONSTANTS.KEYS.FUTURE_DATE } };
    }

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < AUTH_CONSTANTS.VALIDATION.MIN_AGE_YEARS) {
      return {
        minAge: {
          messageKey: AUTH_CONSTANTS.KEYS.MIN_AGE_ERROR,
          requiredAge: AUTH_CONSTANTS.VALIDATION.MIN_AGE_YEARS,
          actualAge: age,
        },
      };
    }

    return null;
  };
}
