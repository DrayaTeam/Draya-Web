import { FormGroup, FormControl } from '@angular/forms';
import { differentEmailValidator } from './different-email.validator';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

describe('Different Email Validator', () => {
  let group: FormGroup;
  const validator = differentEmailValidator();

  beforeEach(() => {
    group = new FormGroup({
      email: new FormControl(''),
      parentGuardianEmail: new FormControl(''),
    });
  });

  it('should return null if email is empty', () => {
    group.patchValue({ parentGuardianEmail: 'parent@test.com' });
    expect(validator(group)).toBeNull();
  });

  it('should return null if parentGuardianEmail is empty', () => {
    group.patchValue({ email: 'student@test.com' });
    expect(validator(group)).toBeNull();
  });

  it('should return null if emails are different', () => {
    group.patchValue({
      email: 'student@test.com',
      parentGuardianEmail: 'parent@test.com',
    });
    expect(validator(group)).toBeNull();
  });

  it('should return error if emails are exactly the same', () => {
    group.patchValue({
      email: 'same@test.com',
      parentGuardianEmail: 'same@test.com',
    });
    const result = validator(group);
    expect(result).toBeTruthy();
    expect(result?.['differentEmail'].messageKey).toBe(AUTH_CONSTANTS.KEYS.SAME_EMAIL_ERROR);
  });

  it('should return error if emails are same but differ in case', () => {
    group.patchValue({
      email: 'Same@Test.com',
      parentGuardianEmail: 'same@test.com',
    });
    const result = validator(group);
    expect(result).toBeTruthy();
    expect(result?.['differentEmail'].messageKey).toBe(AUTH_CONSTANTS.KEYS.SAME_EMAIL_ERROR);
  });
});
