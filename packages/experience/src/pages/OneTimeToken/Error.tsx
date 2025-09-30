import type { TFuncKey } from 'i18next';
import { useLocation } from 'react-router-dom';
import { define, object, optional, string, validate } from 'superstruct';

import ErrorPage from '@/pages/ErrorPage';

// Runtime guard for i18n key strings while preserving TFuncKey typing at compile-time
const tFunctionKey = define<TFuncKey>('TFuncKey', (value) => typeof value === 'string');
const stateGuard = object({
  title: optional(tFunctionKey),
  message: optional(tFunctionKey),
  errorMessage: optional(string()),
});

const Error = () => {
  const { state } = useLocation();
  const [, parsed] = validate(state, stateGuard);

  return (
    <ErrorPage
      isNavbarHidden
      title={parsed?.title ?? 'error.invalid_link'}
      message={parsed?.message ?? 'error.invalid_link_description'}
      rawMessage={parsed?.errorMessage}
    />
  );
};

export default Error;
