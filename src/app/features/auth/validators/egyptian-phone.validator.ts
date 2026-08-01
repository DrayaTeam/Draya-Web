import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

export function egyptianPhoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    const isValid = AUTH_CONSTANTS.VALIDATION.EGYPTIAN_PHONE_REGEX.test(value);
    
    if (!isValid) {
      return { 
        egyptianPhone: { 
          messageKey: AUTH_CONSTANTS.KEYS.INVALID_PHONE 
        } 
      };
    }

    return null;
  };
}
