import { ConsoleLog } from '@logto/shared';

// The explicit type annotation is required to make `.fatal()`
// works correctly without `return`:
//
// ```ts
// const foo: number | undefined;
// consoleLog.fatal();
// typeof foo // Still `number | undefined` without explicit type annotation
// ```
//
// For now I have no idea why.
export const consoleLog: ConsoleLog = new ConsoleLog();
