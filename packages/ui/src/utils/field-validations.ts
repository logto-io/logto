import { parsePhoneNumberWithError, ParseError } from 'libphonenumber-js/mobile';

import type { ErrorType } from '@/components/ErrorMessage';
import { parseE164Number } from '@/utils/country-code';

// TODO: clean up this file and merge to form utils

export const usernameRegex = /^[A-Z_a-z-][\w-]*$/;
export const emailRegex = /^\S+@\S+\.\S+$/;

export const requiredValidation = (
  type: 'username' | 'password',
  value: string
): ErrorType | undefined => {
  if (!value) {
    return type === 'username' ? 'username_required' : 'password_required';
  }
};

export const validateUsername = (username: string): ErrorType | undefined => {
  if (!username) {
    return 'username_required';
  }

  if (/^\d/.test(username)) {
    return 'username_should_not_start_with_number';
  }

  if (!usernameRegex.test(username)) {
    return 'username_invalid_charset';
  }
};

export const validateEmail = (email: string): ErrorType | undefined => {
  if (!emailRegex.test(email)) {
    return 'invalid_email';
  }
};

export const validatePhone = (value: string): ErrorType | undefined => {
  try {
    const phoneNumber = parsePhoneNumberWithError(parseE164Number(value));

    if (!phoneNumber.isValid()) {
      return 'invalid_phone';
    }
  } catch (error: unknown) {
    if (error instanceof ParseError) {
      return 'invalid_phone';
    }

    throw error;
  }
};

export const passwordValidation = (password: string): ErrorType | undefined => {
  if (!password) {
    return 'password_required';
  }

  if (password.length < 6) {
    return { code: 'password_min_length', data: { min: 6 } };
  }
};

export const confirmPasswordValidation = (
  password: string,
  confirmPassword: string
): ErrorType | undefined => {
  if (password !== confirmPassword) {
    return { code: 'passwords_do_not_match' };
  }
};
