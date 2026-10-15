import {
  AuthenticationFactor,
  AuthenticationFactorClass,
  AuthenticationMethodReference,
  AuthenticationProofRole,
  VerificationType,
  getAuthenticationFactor,
  getAuthenticationFactorClass,
  getAuthenticationMethodReferences,
  type AuthenticationProof,
} from '@logto/schemas';

import { type VerificationRecord } from '../verifications/index.js';

/** The id of the proof for a password established through the profile, which has no record. */
const establishedPasswordProofId = 'password';

const keyOf = ({ id, role }: Pick<AuthenticationProof, 'id' | 'role'>) => `${id}:${role}`;

/**
 * The authentication proofs of one interaction: what the user proved about the account, recorded
 * at the single touchpoint that consumed each credential (`createUser()`, `identifyUser()`, a
 * profile or MFA bind, an MFA challenge, or the profile's password transition).
 *
 * The collection is staged in memory and persisted by `ExperienceInteraction.save()` together with
 * the effect that produced each proof: an operation that throws never reaches `save()`, so it
 * leaves no proof behind. It has the lifetime of `profile.data` and is cleared in the same places.
 *
 * Entries are keyed by record id and role, so a retry overwrites rather than duplicates. The
 * proofs carry no timestamp: `auth_time` is stamped by the provider when the interaction is
 * submitted, which is the moment the session is established.
 */
export class AuthenticationProofs {
  readonly #proofs = new Map<string, AuthenticationProof>();

  constructor(data: AuthenticationProof[] = []) {
    for (const proof of data) {
      this.#proofs.set(keyOf(proof), proof);
    }
  }

  get proofs(): readonly AuthenticationProof[] {
    return [...this.#proofs.values()];
  }

  get data(): AuthenticationProof[] {
    return this.proofs.map((proof) => ({ ...proof, amr: [...proof.amr] }));
  }

  /**
   * Stage the proof a verification record contributes in the given role. The factor, class and AMR
   * values come from the record type.
   *
   * Declared non-proofs, written here so that their absence reads as a decision:
   *
   * - Binding backup codes (`BackupCode` in the `bind` role) generates recovery codes and proves
   *   nothing; only a backup code challenge is a proof.
   */
  stage(record: VerificationRecord, role: AuthenticationProofRole) {
    if (record.type === VerificationType.BackupCode && role === AuthenticationProofRole.Bind) {
      return;
    }

    this.set({
      id: record.id,
      factor: getAuthenticationFactor(record.type),
      class: getAuthenticationFactorClass(record.type),
      amr: [...getAuthenticationMethodReferences(record.type)],
      role,
    });
  }

  /**
   * Stage the proof for a password established through the profile: setting a password is the
   * establishment itself, and there is no verification record to consume.
   */
  stageEstablishedPassword() {
    this.set({
      id: establishedPasswordProofId,
      factor: AuthenticationFactor.Password,
      class: AuthenticationFactorClass.FirstFactor,
      amr: [AuthenticationMethodReference.Password],
      role: AuthenticationProofRole.Bind,
    });
  }

  /** Drop every proof; called wherever `profile.data` is cleared. */
  clear() {
    this.#proofs.clear();
  }

  private set(proof: AuthenticationProof) {
    this.#proofs.set(keyOf(proof), proof);
  }
}
