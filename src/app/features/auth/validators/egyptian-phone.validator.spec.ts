import { FormControl } from '@angular/forms';
import { egyptianPhoneValidator } from './egyptian-phone.validator';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

describe('Egyptian Phone Validator', () => {
  let control: FormControl;
  const validator = egyptianPhoneValidator();

  beforeEach(() => {
    control = new FormControl('');
  });

  it('should return null for empty value', () => {
    expect(validator(control)).toBeNull();
  });

  it('should return null for valid Vodafone number (010)', () => {
    control.setValue('01012345678');
    expect(validator(control)).toBeNull();
  });

  it('should return null for valid Etisalat number (011)', () => {
    control.setValue('01112345678');
    expect(validator(control)).toBeNull();
  });

  it('should return null for valid Orange number (012)', () => {
    control.setValue('01212345678');
    expect(validator(control)).toBeNull();
  });

  it('should return null for valid WE number (015)', () => {
    control.setValue('01512345678');
    expect(validator(control)).toBeNull();
  });

  it('should return error for wrong prefix (e.g. 013)', () => {
    control.setValue('01312345678');
    const result = validator(control);
    expect(result).toBeTruthy();
    expect(result?.['egyptianPhone'].messageKey).toBe(AUTH_CONSTANTS.KEYS.INVALID_PHONE);
  });

  it('should return error for wrong length (too short)', () => {
    control.setValue('0101234567');
    expect(validator(control)).toBeTruthy();
  });

  it('should return error for wrong length (too long)', () => {
    control.setValue('010123456789');
    expect(validator(control)).toBeTruthy();
  });

  it('should return error if it contains letters', () => {
    control.setValue('0101234567a');
    expect(validator(control)).toBeTruthy();
  });
});
