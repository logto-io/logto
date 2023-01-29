import type { FieldError } from 'react-hook-form';

import type { ErrorType } from '@/components/ErrorMessage';

export const passwordErrorWatcher = (error?: FieldError): ErrorType | undefined => {
  switch (error?.type) {
    case 'required':
      return 'password_required';
    case 'minLength':
      return { code: 'password_min_length', data: { min: 6 } };
    default:
  }
};
