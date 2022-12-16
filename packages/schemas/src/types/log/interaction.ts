import { Event } from '../interactions.js';

import Flow = Event;

export { Flow };

/** Identifier to verify. */
export enum Identifier {
  Username = 'Username',
  Email = 'Email',
  Phone = 'Phone',
  SocialId = 'SocialId',
}

/** Method to verify the identifier */
export enum Method {
  Password = 'Password',
  VerificationCode = 'VerificationCode',
  Social = 'Social',
}

export enum Action {
  /** Create a new entity. (E.g. create an interaction, create a verification code) */
  Create = 'Create',
  /** Update an existing entity. (E.g. change interaction type) */
  Update = 'Update',
  /** Submit updated info to an entity, or submit to the system. (E.g. submit an interaction, submit a verification code to get verified) */
  Submit = 'Submit',
}

/**
 * The forgot password flow log key type. Format:
 *
 * ```ts
 * `ForgotPassword.${Identifier}.VerificationCode.${Action}`
 * ```
 *
 * Since we can use only verification code for resetting password,
 * {@link Identifier.SocialId} is excluded and the method is fixed to {@link Method.VerificationCode}.
 *
 * {@link Action} definition:
 *
 * - {@link Action.Create} indicates the process of generating and sending a verification code.
 * - {@link Action.Submit} indicates the process of submitting a verification code to get verified.
 */
export type ForgotPasswordLogKey = `${Flow.ForgotPassword}.${Exclude<
  Identifier,
  'SocialId'
>}.${Method.VerificationCode}.${Action.Create | Action.Submit}`;

type SignInRegisterFlow = Exclude<Flow, 'ForgotPassword'>;

/**
 * The sign-in / register flow log key type. Format:
 *
 * ```ts
 * `${Flow}.${Identifier}.${Method}.${Action}`
 * ```
 *
 * Restrictions:
 *
 * - For social identifier and method, the value can only be `SignIn.SocialId.Social.Create`.
 * - For password method, the action can only be `Create`.
 * - For verification code method, the action can be `Create` or `Submit`.
 *
 * @see {@link SignInRegisterFlow}, {@link Identifier}, {@link Method}, {@link Action} for all available enums.
 */
export type SignInRegisterLogKey =
  | `${Flow.SignIn}.${Identifier.SocialId}.${Method.Social}.${Action.Create}`
  | `${SignInRegisterFlow}.${Exclude<Identifier, 'SocialId'>}.${Method.Password}.${Action.Create}`
  | `${SignInRegisterFlow}.${Exclude<Identifier, 'SocialId'>}.${Method.VerificationCode}.${
      | Action.Create
      | Action.Submit}`;

export type FlowLogKey = `${Flow}.${Action}`;

/**
 * The union type of all available log keys for interaction.
 *
 * There are two formats of a key:
 *
 * ```ts
 * `${Flow}.${Identifier}.${Method}.${Action}`
 * `${Flow}.${Action}`
 * ```
 *
 * The key MUST describe an {@link Action}:
 *
 * - {@link Action.Create} (Create a new entity);
 * - {@link Action.Update} (Update an existing entity.);
 * - {@link Action.Submit} (Submit updated info to an entity, or submit to the system).
 *
 * In an interaction, ONLY the interaction itself and verification codes can be submitted, i.e.:
 *
 * ```ts
 * `${Flow}.Submit`
 * `${Flow}.${Identifier}.VerificationCode.Submit`
 * ```
 *
 * There may be more restrictions, please see the specific type to learn more.
 */
export type LogKey = ForgotPasswordLogKey | SignInRegisterLogKey | FlowLogKey;
