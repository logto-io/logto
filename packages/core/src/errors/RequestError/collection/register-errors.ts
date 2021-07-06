export enum RegisterErrorCode {
  UsernameExists = 'register.username_exists',
}

export const registerErrorMessage: Record<RegisterErrorCode, string> = {
  [RegisterErrorCode.UsernameExists]: 'The username already exists.',
};
