import { FormControl } from '@angular/forms';
import { minAgeValidator } from './min-age.validator';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

describe('Min Age Validator', () => {
  let control: FormControl;
  const validator = minAgeValidator();

  beforeEach(() => {
    control = new FormControl('');
  });

  it('should return null for empty value', () => {
    expect(validator(control)).toBeNull();
  });

  it('should return error for unparsable date', () => {
    control.setValue('invalid-date');
    const result = validator(control);
    expect(result).toBeTruthy();
    expect(result?.['minAge'].messageKey).toBe(AUTH_CONSTANTS.KEYS.INVALID_DATE);
  });

  it('should return error for future date', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    control.setValue(futureDate.toISOString());
    const result = validator(control);
    expect(result).toBeTruthy();
    expect(result?.['minAge'].messageKey).toBe(AUTH_CONSTANTS.KEYS.FUTURE_DATE);
  });

  it('should return error if age is less than min age (10)', () => {
    const tooYoung = new Date();
    tooYoung.setFullYear(tooYoung.getFullYear() - 9);
    control.setValue(tooYoung.toISOString());
    const result = validator(control);
    expect(result).toBeTruthy();
    expect(result?.['minAge'].messageKey).toBe(AUTH_CONSTANTS.KEYS.MIN_AGE_ERROR);
    expect(result?.['minAge'].requiredAge).toBe(10);
    expect(result?.['minAge'].actualAge).toBe(9);
  });

  it('should return null if age is exactly min age (10)', () => {
    const justOldEnough = new Date();
    justOldEnough.setFullYear(justOldEnough.getFullYear() - 10);
    control.setValue(justOldEnough.toISOString());
    expect(validator(control)).toBeNull();
  });

  it('should return null if age is greater than min age', () => {
    const oldEnough = new Date();
    oldEnough.setFullYear(oldEnough.getFullYear() - 15);
    control.setValue(oldEnough.toISOString());
    expect(validator(control)).toBeNull();
  });
});
