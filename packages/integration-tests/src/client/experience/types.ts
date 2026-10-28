import { type TemplateType, type SocialUserInfo } from '@logto/connector-kit';
import {
  type BindBackupCode,
  type BindTotp,
  type BindWebAuthn,
  type InteractionAuthenticationContext,
  type VerificationType,
  type InteractionEvent,
  type User,
  type VerificationIdentifier,
} from '@logto/schemas';

export type RedirectResponse = {
  redirectTo: string;
};

/**
 * @see {@link file://./../../../../../core/src/routes/experience/types.ts}
 */
export type SanitizedInteractionStorageData = {
  interactionEvent: InteractionEvent;
  userId?: string;
  authenticationContext?: InteractionAuthenticationContext;
  profile?: Partial<
    Pick<
      User,
      'avatar' | 'name' | 'username' | 'primaryEmail' | 'primaryPhone' | 'profile' | 'customData'
    >
  > & {
    socialIdentity?: {
      target: string;
      userInfo: SocialUserInfo;
    };
    enterpriseSsoIdentity?: {
      identityId: string;
      ssoConnectorId: string;
      issuer: string;
      detail: Record<string, unknown>;
    };
    syncedEnterpriseSsoIdentity?: {
      identityId: string;
      issuer: string;
      detail: Record<string, unknown>;
    };
    jitOrganizationIds?: string[];
  };
  verificationRecords?: Array<{
    id: string;
    type: VerificationType;
    verified?: boolean;
    identifier?: VerificationIdentifier;
    userId?: string;
    connectorId?: string;
    templateType?: TemplateType;
    socialUserInfo?: SocialUserInfo;
    enterpriseSsoUserInfo?: Record<string, unknown>;
    oneTimeTokenContext?: Record<string, unknown>;
  }>;
  mfa?: {
    mfaEnabled?: boolean;
    mfaSkipped?: boolean;
    passkeySkipped?: boolean;
    totp?: Pick<BindTotp, 'type'>;
    webAuthn?: BindWebAuthn[];
    backupCode?: Omit<BindBackupCode, 'codes'>;
  };
  captcha?: {
    verified: boolean;
    skipped: boolean;
  };
};
