import { type User, type VerificationType } from '@logto/schemas';

type Data<T> = {
  id: string;
  type: T;
};

/** The abstract class for all verification records. */
export abstract class VerificationRecord<
  T extends VerificationType = VerificationType,
  Json extends Data<T> = Data<T>,
> {
  abstract readonly id: string;
  abstract readonly type: T;

  abstract get isVerified(): boolean;

  abstract toJson(): Json;
}

type IdentifierVerificationType =
  | VerificationType.VerificationCode
  | VerificationType.Password
  | VerificationType.Social
  | VerificationType.EnterpriseSso;

/**
 * The abstract class for all identifier verification records.
 *
 * - A `identifyUser` method must be provided to identify the user associated with the verification record.
 */
export abstract class IdentifierVerificationRecord<
  T extends VerificationType = IdentifierVerificationType,
  Json extends Data<T> = Data<T>,
> extends VerificationRecord<T, Json> {
  abstract identifyUser(): Promise<User>;
}
