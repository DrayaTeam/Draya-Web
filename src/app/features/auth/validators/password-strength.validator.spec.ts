import { FormControl } from '@angular/forms';
import { passwordStrengthValidator, calculatePasswordStrength } from './password-strength.validator';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

describe('Password Strength Validator', () => {
  let control: FormControl;
  const validator = passwordStrengthValidator();

  beforeEach(() => {
    control = new FormControl('');
  });

  describe('calculatePasswordStrength', () => {
    it('should return weak for empty password', () => {
      expect(calculatePasswordStrength('')).toBe('weak');
    });

    it('should return weak for short simple passwords', () => {
      expect(calculatePasswordStrength('abc')).toBe('weak');
      expect(calculatePasswordStrength('password123')).toBe('weak'); // No upper, no special
    });

    it('should return medium for passwords missing some requirements', () => {
      expect(calculatePasswordStrength('Password123')).toBe('medium'); // Missing special char
    });

    it('should return strong for fully compliant passwords', () => {
      expect(calculatePasswordStrength('P@ssword12345')).toBe('strong');
    });
  });

  describe('passwordStrengthValidator', () => {
    it('should return null for empty value', () => {
      expect(validator(control)).toBeNull();
    });

    it('should return null for valid strong password', () => {
      control.setValue('P@ssword12345');
      expect(validator(control)).toBeNull();
    });

    it('should return error if password is too short', () => {
      control.setValue('P@ss123'); // Length < 12
      const result = validator(control);
      expect(result).toBeTruthy();
      expect(result?.['passwordStrength'].messageKey).toBe(AUTH_CONSTANTS.KEYS.PASSWORD_WEAK);
      expect(result?.['passwordStrength'].requirements.minLength).toBeFalse();
    });

    it('should return error if password lacks uppercase letter', () => {
      control.setValue('p@ssword12345');
      const result = validator(control);
      expect(result?.['passwordStrength'].requirements.upperCase).toBeFalse();
    });

    it('should return error if password lacks lowercase letter', () => {
      control.setValue('P@SSWORD12345');
      const result = validator(control);
      expect(result?.['passwordStrength'].requirements.lowerCase).toBeFalse();
    });

    it('should return error if password lacks digit', () => {
      control.setValue('P@sswordLongTest');
      const result = validator(control);
      expect(result?.['passwordStrength'].requirements.numeric).toBeFalse();
    });

    it('should return error if password lacks special character', () => {
      control.setValue('Password12345');
      const result = validator(control);
      expect(result?.['passwordStrength'].requirements.special).toBeFalse();
    });
  });
});
