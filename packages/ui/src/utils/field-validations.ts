import i18next from 'i18next';

import { ErrorType } from '@/components/ErrorMessage';

const usernameRegex = /^[A-Z_a-z-][\w-]*$/;
const emailRegex = /^\S+@\S+\.\S+$/;

export const usernameValidation = (username: string): ErrorType | undefined => {
  if (!username) {
    return { code: 'required', data: { field: i18next.t('input.username') } };
  }

  if (/\d/.test(username.slice(0, 1))) {
    return 'username_should_not_start_with_number';
  }

  if (!usernameRegex.test(username)) {
    return 'username_valid_charset';
  }
};

export const passwordValidation = (password: string): ErrorType | undefined => {
  if (!password) {
    return { code: 'required', data: { field: i18next.t('input.password') } };
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

export const emailValidation = (email: string): ErrorType | undefined => {
  if (!emailRegex.test(email)) {
    return 'invalid_email';
  }
};
