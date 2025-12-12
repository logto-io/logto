import { appInsights } from '@logto/app-insights/node';
import type { SendMessagePayload, TemplateType } from '@logto/connector-kit';
import { templateTypeGuard, ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import {
  buildBuiltInApplicationDataForTenant,
  isBuiltInApplicationId,
  type Passcode,
  type User,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { customAlphabet, nanoid } from 'nanoid';

import RequestError from '#src/errors/RequestError/index.js';
import type { ConnectorLibrary } from '#src/libraries/connector.js';
import type Queries from '#src/tenants/Queries.js';
import {
  buildApplicationContextInfo,
  buildOrganizationContextInfo,
  buildUserContextInfo,
} from '#src/utils/connectors/extra-information.js';
import { ConnectorType, type VerificationCodeContextInfo } from '#src/utils/connectors/types.js';

export const passcodeLength = 6;
const randomCode = customAlphabet('1234567890', passcodeLength);

export const passcodeExpiration = 10 * 60 * 1000; // 10 minutes.
export const passcodeMaxTryCount = 10;

export type PasscodeLibrary = ReturnType<typeof createPasscodeLibrary>;

export type SendPasscodeContextPayload = Pick<SendMessagePayload, 'locale' | 'uiLocales'> &
  VerificationCodeContextInfo & {
    /** The client IP address for rate limiting and fraud detection. */
    ip?: string;
  };

export const createPasscodeLibrary = (queries: Queries, connectorLibrary: ConnectorLibrary) => {
  const {
    consumePasscode,
    deletePasscodesByIds,
    findUnconsumedPasscodeByJtiAndType,
    findUnconsumedPasscodesByJtiAndType,
    findUnconsumedPasscodeByIdentifierAndType,
    findUnconsumedPasscodesByIdentifierAndType,
    increasePasscodeTryCount,
    insertPasscode,
  } = queries.passcodes;
  const { getMessageConnector } = connectorLibrary;

  const createPasscode = async (
    jti: string | undefined,
    type: TemplateType,
    payload: { phone: string } | { email: string }
  ) => {
    // Disable existing passcodes.
    const passcodes = jti
      ? // Session based flows. E.g. SignIn, Register, etc.
        await findUnconsumedPasscodesByJtiAndType(jti, type)
      : // Generic flow. E.g. Triggered by management API
        await findUnconsumedPasscodesByIdentifierAndType({ type, ...payload });

    if (passcodes.length > 0) {
      await deletePasscodesByIds(passcodes.map(({ id }) => id));
    }

    return insertPasscode({
      id: nanoid(),
      interactionJti: jti,
      type,
      code: randomCode(),
      ...payload,
    });
  };

  /**
   *
   * @param {Passcode} passcode The passcode object being sent.
   * @param {SendPasscodeContextPayload} contextPayload The extra context information for the verification code email template.
   */
  const sendPasscode = async (passcode: Passcode, contextPayload?: SendPasscodeContextPayload) => {
    const emailOrPhone = passcode.email ?? passcode.phone;

    if (!emailOrPhone) {
      throw new RequestError('verification_code.phone_email_empty');
    }

    const expectType = passcode.phone ? ConnectorType.Sms : ConnectorType.Email;
    const connector = await getMessageConnector(expectType);
    const { dbEntry, metadata, sendMessage } = connector;

    const messageTypeResult = templateTypeGuard.safeParse(passcode.type);

    if (!messageTypeResult.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig);
    }

    const { ip, ...payloadContext } = contextPayload ?? {};

    const response = await sendMessage({
      to: emailOrPhone,
      type: messageTypeResult.data,
      payload: {
        code: passcode.code,
        ...payloadContext,
      },
      ...(ip && { ip }),
    });

    return { dbEntry, metadata, response };
  };

  const verifyPasscode = async (
    jti: string | undefined,
    type: TemplateType,
    code: string,
    payload: { phone: string } | { email: string }
  ): Promise<void> => {
    const passcode = jti
      ? // Session based flows. E.g. SignIn, Register, etc.
        await findUnconsumedPasscodeByJtiAndType(jti, type)
      : // Generic flow. E.g. Triggered by management API
        await findUnconsumedPasscodeByIdentifierAndType({ type, ...payload });

    if (!passcode) {
      throw new RequestError('verification_code.not_found');
    }

    if ('phone' in payload && passcode.phone !== payload.phone) {
      throw new RequestError('verification_code.phone_mismatch');
    }

    if ('email' in payload && passcode.email !== payload.email) {
      throw new RequestError('verification_code.email_mismatch');
    }

    if (passcode.createdAt + passcodeExpiration < Date.now()) {
      throw new RequestError('verification_code.expired');
    }

    if (passcode.tryCount >= passcodeMaxTryCount) {
      throw new RequestError('verification_code.exceed_max_try');
    }

    if (code !== passcode.code) {
      await increasePasscodeTryCount(passcode.id);
      throw new RequestError('verification_code.code_mismatch');
    }

    await consumePasscode(passcode.id);
  };

  /**
   * Build the context information for the verification code email template.
   * The context data may vary depending on the context of the verification code request.
   */
  const buildVerificationCodeContext = async ({
    applicationId,
    organizationId,
    userId,
    user,
  }: {
    applicationId?: string;
    organizationId?: string;
    userId?: string;
    /*
     * If available in the request context, directly providing the user object
     * is more efficient than providing the userId.
     */
    user?: User;
  }): Promise<VerificationCodeContextInfo> => {
    try {
      const [application, applicationSignInExperience, organization, userData] = await Promise.all([
        applicationId
          ? isBuiltInApplicationId(applicationId)
            ? Promise.resolve(buildBuiltInApplicationDataForTenant('', applicationId))
            : queries.applications.findApplicationById(applicationId)
          : undefined,
        applicationId
          ? queries.applicationSignInExperiences.safeFindSignInExperienceByApplicationId(
              applicationId
            )
          : undefined,
        organizationId ? queries.organizations.findById(organizationId) : undefined,
        user ?? (userId ? queries.users.findUserById(userId) : undefined),
      ]);

      return {
        ...conditional(
          application && {
            application: buildApplicationContextInfo(application, applicationSignInExperience),
          }
        ),
        ...conditional(
          organization && { organization: buildOrganizationContextInfo(organization) }
        ),
        ...conditional(userData && { user: buildUserContextInfo(userData) }),
      };
    } catch (error: unknown) {
      void appInsights.trackException(error);

      // Should not block the verification code sending if the context information is not available.
      return {};
    }
  };

  return { createPasscode, sendPasscode, verifyPasscode, buildVerificationCodeContext };
};
