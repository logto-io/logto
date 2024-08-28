import type { i18n } from 'i18next';
import _i18next from 'i18next';

// This may be fixed by a cjs require wrapper. TBD.
// See https://github.com/microsoft/TypeScript/issues/49189
// eslint-disable-next-line no-restricted-syntax
export const i18next = _i18next as unknown as i18n;
