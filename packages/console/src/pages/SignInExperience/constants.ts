import { SignInMethods } from '@logto/schemas';

export const signInMethods: Array<keyof SignInMethods> = ['username', 'sms', 'email', 'social'];
