import {
  InteractionEvent,
  MissingProfile,
  type SignInExperience,
  SignInIdentifier,
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
    case VerificationType.EmailVerificationCode:
    case VerificationType.PhoneVerificationCode: {
      const {
        identifier: { type, value },
      } = verificationRecord;

      return type === SignInIdentifier.Email ? value : undefined;
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

  constructor(
    private readonly libraries: Libraries,
    private readonly queries: Queries
  ) {}

  /**
   * @throws {RequestError} with status 403 if the interaction event is not allowed
   */
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

  public async guardIdentificationMethod(
    event: InteractionEvent.ForgotPassword | InteractionEvent.SignIn,
    verificationRecord: VerificationRecord
  ) {
    await this.guardInteractionEvent(event);

    switch (event) {
      case InteractionEvent.SignIn: {
        await this.guardSignInVerificationMethod(verificationRecord);
        break;
      }
      case InteractionEvent.ForgotPassword: {
        this.guardForgotPasswordVerificationMethod(verificationRecord);
        break;
      }
    }
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

  public async getMfaSettings() {
    const { mfa } = await this.getSignInExperienceData();

    return mfa;
  }

  public async getPasswordPolicy() {
    const { passwordPolicy } = await this.getSignInExperienceData();

    return passwordPolicy;
  }

  public async getSignInExperienceData() {
    this.signInExperienceDataCache ||=
      await this.queries.signInExperiences.findDefaultSignInExperience();

    return this.signInExperienceDataCache;
  }

  public async getMandatoryUserProfileBySignUpMethods(): Promise<Set<MissingProfile>> {
    const {
      signUp: { identifiers, password },
    } = await this.getSignInExperienceData();
    const mandatoryUserProfile = new Set<MissingProfile>();

    if (password) {
      mandatoryUserProfile.add(MissingProfile.password);
    }

    if (identifiers.includes(SignInIdentifier.Username)) {
      mandatoryUserProfile.add(MissingProfile.username);
    }

    if (
      identifiers.includes(SignInIdentifier.Email) &&
      identifiers.includes(SignInIdentifier.Phone)
    ) {
      mandatoryUserProfile.add(MissingProfile.emailOrPhone);
      return mandatoryUserProfile;
    }

    if (identifiers.includes(SignInIdentifier.Email)) {
      mandatoryUserProfile.add(MissingProfile.email);
    }

    if (identifiers.includes(SignInIdentifier.Phone)) {
      mandatoryUserProfile.add(MissingProfile.phone);
    }

    return mandatoryUserProfile;
  }

  /**
   * Guard the verification records contains email identifier with SSO enabled
   *
   * @remarks
   * Email identifier with SSO enabled domain will be blocked.
   * Can only verify/identify via SSO verification record.
   *
   * @throws {RequestError} with status 422 if the email identifier is SSO enabled
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

  /**
   * @throws {RequestError} with status 422 if the verification record type is not enabled
   * @throws {RequestError} with status 422 if the email identifier is SSO enabled
   */
  private async guardSignInVerificationMethod(verificationRecord: VerificationRecord) {
    const {
      signIn: { methods: signInMethods },
      singleSignOnEnabled,
    } = await this.getSignInExperienceData();

    switch (verificationRecord.type) {
      case VerificationType.Password:
      case VerificationType.EmailVerificationCode:
      case VerificationType.PhoneVerificationCode: {
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

    await this.guardSsoOnlyEmailIdentifier(verificationRecord);
  }

  /** Forgot password only supports verification code type verification record */
  private guardForgotPasswordVerificationMethod(verificationRecord: VerificationRecord) {
    assertThat(
      verificationRecord.type === VerificationType.EmailVerificationCode ||
        verificationRecord.type === VerificationType.PhoneVerificationCode,
      new RequestError({ code: 'session.not_supported_for_forgot_password', status: 422 })
    );
  }
}
