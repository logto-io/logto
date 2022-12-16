import { Event } from '../interactions.js';

import Flow = Event;

export { Flow };

export enum Identifier {
  Username = 'Username',
  Email = 'Email',
  Phone = 'Phone',
  SocialId = 'SocialId',
}

export enum Method {
  Password = 'Password',
  Passcode = 'Passcode',
  Social = 'Social',
}

export enum Action {
  Submit = 'Submit',
  Create = 'Create',
}

export type ForgotPasswordLogKey = `${Flow.ForgotPassword}.${Exclude<
  Identifier,
  'SocialId'
>}.${Method.Passcode}.${Action}`;

type SignInRegisterFlow = Exclude<Flow, 'ForgotPassword'>;

export type SignInRegisterLogKey =
  | `${Flow.SignIn}.${Identifier.SocialId}.${Method.Social}.${Action.Submit}`
  | `${SignInRegisterFlow}.${Exclude<Identifier, 'SocialId'>}.${Method.Password}.${Action.Submit}`
  | `${SignInRegisterFlow}.${Exclude<Identifier, 'SocialId'>}.${Method.Passcode}.${Action}`;

export type FlowLogKey = `${Flow}.${Action}`;

export type LogKey = ForgotPasswordLogKey | SignInRegisterLogKey | FlowLogKey;
