import crypto from 'node:crypto';

import { PasswordPolicyChecker } from '@logto/core-kit';
import {
  InteractionEvent,
  type SignInExperience,
  SignInMode,
  VerificationType,
} from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { type VerificationRecord } from '../verifications/index.js';

const getEmailIdentifierFromVerificationRecord = (verificationRecord: VerificationRecord) => {
  switch (verificationRecord.type) {
    case VerificationType.Password:
    case VerificationType.VerificationCode: {
      const {
        identifier: { type, value },
      } = verificationRecord;

      return type === 'email' ? value : undefined;
    }
    case VerificationType.Social: {
      const { socialUserInfo } = verificationRecord;
      return socialUserInfo?.email;
    }
    default: {
      break;
    }
  }
};

/**
 *  SignInExperienceValidator class provides all the sign-in experience settings validation logic.
 *
 * - Guard the interaction event based on the sign-in experience settings
 * - Guard the identification method based on the sign-in experience settings
 * - Guard the email identifier with SSO enabled domains
 */
export class SignInExperienceValidator {
  private signInExperienceDataCache?: SignInExperience;
  #passwordPolicyChecker?: PasswordPolicyChecker;

  constructor(
    private readonly libraries: Libraries,
    private readonly queries: Queries
  ) {}

  public async guardInteractionEvent(event: InteractionEvent) {
    const { signInMode } = await this.getSignInExperienceData();

    switch (event) {
      case InteractionEvent.SignIn: {
        assertThat(
          signInMode !== SignInMode.Register,
          new RequestError({ code: 'auth.forbidden', status: 403 })
        );
        break;
      }
      case InteractionEvent.Register: {
        assertThat(
          signInMode !== SignInMode.SignIn,
          new RequestError({ code: 'auth.forbidden', status: 403 })
        );
        break;
      }
      case InteractionEvent.ForgotPassword: {
        break;
      }
    }
  }

  public async verifyIdentificationMethod(
    event: InteractionEvent,
    verificationRecord: VerificationRecord
  ) {
    switch (event) {
      case InteractionEvent.SignIn: {
        await this.guardSignInVerificationMethod(verificationRecord);
        break;
      }
      case InteractionEvent.Register: {
        await this.guardRegisterVerificationMethod(verificationRecord);
        break;
      }
      case InteractionEvent.ForgotPassword: {
        this.guardForgotPasswordVerificationMethod(verificationRecord);
        break;
      }
    }

    await this.guardSsoOnlyEmailIdentifier(verificationRecord);
  }

  public async getEnabledSsoConnectorsByEmail(email: string) {
    const domain = email.split('@')[1];
    const { singleSignOnEnabled } = await this.getSignInExperienceData();

    if (!singleSignOnEnabled || !domain) {
      return [];
    }

    const { getAvailableSsoConnectors } = this.libraries.ssoConnectors;
    const availableSsoConnectors = await getAvailableSsoConnectors();

    return availableSsoConnectors.filter(({ domains }) => domains.includes(domain));
  }

  public async getSignInExperienceData() {
    this.signInExperienceDataCache ||=
      await this.queries.signInExperiences.findDefaultSignInExperience();

    return this.signInExperienceDataCache;
  }

  public async getPasswordPolicyChecker() {
    if (!this.#passwordPolicyChecker) {
      const { passwordPolicy } = await this.getSignInExperienceData();
      this.#passwordPolicyChecker = new PasswordPolicyChecker(passwordPolicy, crypto.subtle);
    }

    return this.#passwordPolicyChecker;
  }

  /**
   * Guard the verification records contains email identifier with SSO enabled
   *
   * @remarks
   * Email identifier with SSO enabled domain will be blocked.
   * Can only verify/identify via SSO verification record.
   *
   * - VerificationCode with email identifier
   * - Social userinfo with email
   **/
  private async guardSsoOnlyEmailIdentifier(verificationRecord: VerificationRecord) {
    const emailIdentifier = getEmailIdentifierFromVerificationRecord(verificationRecord);

    if (!emailIdentifier) {
      return;
    }

    const enabledSsoConnectors = await this.getEnabledSsoConnectorsByEmail(emailIdentifier);

    assertThat(
      enabledSsoConnectors.length === 0,
      new RequestError(
        {
          code: 'session.sso_enabled',
          status: 422,
        },
        {
          ssoConnectors: enabledSsoConnectors,
        }
      )
    );
  }

  private async guardSignInVerificationMethod(verificationRecord: VerificationRecord) {
    const {
      signIn: { methods: signInMethods },
      singleSignOnEnabled,
    } = await this.getSignInExperienceData();

    switch (verificationRecord.type) {
      case VerificationType.Password:
      case VerificationType.VerificationCode: {
        const {
          identifier: { type },
        } = verificationRecord;

        assertThat(
          signInMethods.some(({ identifier: method, password, verificationCode }) => {
            return (
              method === type &&
              (verificationRecord.type === VerificationType.Password ? password : verificationCode)
            );
          }),
          new RequestError({ code: 'user.sign_in_method_not_enabled', status: 422 })
        );
        break;
      }

      case VerificationType.Social: {
        // No need to verify social verification method
        break;
      }
      case VerificationType.EnterpriseSso: {
        assertThat(
          singleSignOnEnabled,
          new RequestError({ code: 'user.sign_in_method_not_enabled', status: 422 })
        );
        break;
      }
      default: {
        throw new RequestError({ code: 'user.sign_in_method_not_enabled', status: 422 });
      }
    }
  }

  private async guardRegisterVerificationMethod(verificationRecord: VerificationRecord) {
    const { signUp, singleSignOnEnabled } = await this.getSignInExperienceData();

    switch (verificationRecord.type) {
      // Username and password registration
      case VerificationType.NewPasswordIdentity: {
        const {
          identifier: { type },
        } = verificationRecord;

        assertThat(
          signUp.identifiers.includes(type) && signUp.password,
          new RequestError({ code: 'user.sign_up_method_not_enabled', status: 422 })
        );
        break;
      }
      case VerificationType.VerificationCode: {
        const {
          identifier: { type },
        } = verificationRecord;

        assertThat(
          signUp.identifiers.includes(type) && signUp.verify,
          new RequestError({ code: 'user.sign_up_method_not_enabled', status: 422 })
        );
        break;
      }
      case VerificationType.Social: {
        // No need to verify social verification method
        break;
      }
      case VerificationType.EnterpriseSso: {
        assertThat(
          singleSignOnEnabled,
          new RequestError({ code: 'user.sign_up_method_not_enabled', status: 422 })
        );
        break;
      }
      default: {
        throw new RequestError({ code: 'user.sign_up_method_not_enabled', status: 422 });
      }
    }
  }

  /** Forgot password only supports verification code type verification record */
  private guardForgotPasswordVerificationMethod(verificationRecord: VerificationRecord) {
    assertThat(
      verificationRecord.type === VerificationType.VerificationCode,
      new RequestError({ code: 'session.not_supported_for_forgot_password', status: 422 })
    );
  }
}
