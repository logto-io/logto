export enum GuardErrorCode {
  InvalidInput = 'guard.invalid_input',
}

export const guardErrorMessage: Record<GuardErrorCode, string> = {
  [GuardErrorCode.InvalidInput]: 'The request input is invalid.',
};
