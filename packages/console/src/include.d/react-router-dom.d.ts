/**
 * This type definition file is a workaround for the fact that react-router-dom
 * declares location status type as `any` instead of `unknown`, which ends up
 * causing issues with strict type narrowing in TypeScript.
 *
 * Reference: https://github.com/remix-run/react-router/issues/10241
 */

import 'react-router-dom';

declare module 'react-router-dom' {
  import { type Location } from 'react-router-dom';

  function useLocation(): Omit<Location, 'state'> & { state: unknown };
}
