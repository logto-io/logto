import { ErrorType } from '@/components/ErrorMessage';

const usernameRegex = /^[A-Z_a-z-][\w-]*$/;
const emailRegex = /^\S+@\S+\.\S+$/;

export const requiredValidation = (
  type: 'username' | 'password',
  value: string
): ErrorType | undefined => {
  if (!value) {
    return type === 'username' ? 'username_required' : 'password_required';
  }
};

export const usernameValidation = (username: string): ErrorType | undefined => {
  if (!username) {
    return 'username_required';
  }

  if (/^\d/.test(username)) {
    return 'username_should_not_start_with_number';
  }

  if (!usernameRegex.test(username)) {
    return 'username_valid_charset';
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

export const emailValidation = (email: string): ErrorType | undefined => {
  if (!emailRegex.test(email)) {
    return 'invalid_email';
  }
};
