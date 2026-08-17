import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AUTH_CONSTANTS, PasswordStrength } from '../constants/auth.constants';

export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return 'weak';
  }

  let score = 0;
  if (password.length >= AUTH_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH) score++;
  if (AUTH_CONSTANTS.VALIDATION.PASSWORD_UPPERCASE_REGEX.test(password)) score++;
  if (AUTH_CONSTANTS.VALIDATION.PASSWORD_LOWERCASE_REGEX.test(password)) score++;
  if (AUTH_CONSTANTS.VALIDATION.PASSWORD_DIGIT_REGEX.test(password)) score++;
  if (AUTH_CONSTANTS.VALIDATION.PASSWORD_SPECIAL_REGEX.test(password)) score++;

  if (score < 3) return 'weak';
  if (score < 5) return 'medium';
  return 'strong';
}

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }

    const minLengthValid = value.length >= AUTH_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH;
    const hasUpperCase = AUTH_CONSTANTS.VALIDATION.PASSWORD_UPPERCASE_REGEX.test(value);
    const hasLowerCase = AUTH_CONSTANTS.VALIDATION.PASSWORD_LOWERCASE_REGEX.test(value);
    const hasNumeric = AUTH_CONSTANTS.VALIDATION.PASSWORD_DIGIT_REGEX.test(value);
    const hasSpecial = AUTH_CONSTANTS.VALIDATION.PASSWORD_SPECIAL_REGEX.test(value);

    const passwordValid =
      minLengthValid && hasUpperCase && hasLowerCase && hasNumeric && hasSpecial;

    if (!passwordValid) {
      return {
        passwordStrength: {
          messageKey: AUTH_CONSTANTS.KEYS.PASSWORD_WEAK,
          requirements: {
            minLength: minLengthValid,
            upperCase: hasUpperCase,
            lowerCase: hasLowerCase,
            numeric: hasNumeric,
            special: hasSpecial,
          },
        },
      };
    }

    return null;
  };
}
