import type { Event } from '../interactions.js';

export type Prefix = 'Interaction';

export const prefix: Prefix = 'Interaction';

/** The interaction field to update. This is valid based on we only allow users update one field at a time. */
export enum Field {
  Event = 'Event',
  Identifier = 'Identifier',
  Profile = 'Profile',
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
  /** Change an entity to the end state. (E.g. end an interaction) */
  End = 'End',
}

/**
 * The union type of all available log keys for interaction.
 *
 * The key MUST describe an {@link Action}:
 *
 * - {@link Action.Create} (Create a new entity);
 * - {@link Action.Update} (Update an existing entity);
 * - {@link Action.Submit} (Submit updated info to an entity, or submit to the system).
 *
 * ### Keys breakdown
 *
 * ```ts
 * `Interaction.${Action.Create | Action.End}`
 * ```
 *
 * - Indicates an interaction is started or ended. Normally it is performed by OIDC Provider.
 *
 * ```ts
 * `Interaction.${Event}.${Action.Update | Action.Submit}`
 * ```
 *
 * Since {@link Event} is the primary identifier of interaction type, most of log keys include this info for better query experience.
 * The only exception is the initial creation of an interaction, which has a key of `Interaction.Create`,
 * since we cannot know the type at that time.
 *
 * - When {@link Action} is `Update`, it indicates the type of interaction is updating to {@link Event}.
 * - When {@link Action} is `Submit`, it indicates the whole interaction is being submitted.
 *
 * ```ts
 * `Interaction.${Event}.${Field.Profile}.${Action.Update}`
 * ```
 *
 * - Indicates the profile of an interaction is being updated. It may add or remove profile data.
 *
 * ```ts
 * `Interaction.${Event}.${Field.Identifier}.${Method}.${Action}`
 * ```
 *
 * - Indicates an identifier method is being created or submitted to an interaction.
 *   - When {@link Method} is `VerificationCode`, {@link Action} can be `Create` (generate and send a code) or `Submit` (verify and submit to the identifiers);
 *   - Otherwise, {@link Action} is fixed to `Submit` (other methods can be verified on submitting).
 */
export type LogKey =
  | `${Prefix}.${Action.Create | Action.End}`
  | `${Prefix}.${Event}.${Action.Update | Action.Submit}`
  | `${Prefix}.${Event}.${Field.Profile}.${Action.Update}`
  | `${Prefix}.${Event}.${Field.Identifier}.${Method.VerificationCode}.${
      | Action.Create
      | Action.Submit}`
  | `${Prefix}.${Event}.${Field.Identifier}.${Exclude<
      Method,
      Method.VerificationCode
    >}.${Action.Submit}`;
