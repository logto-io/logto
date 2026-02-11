import {
  InteractionEvent,
  type JwtCustomizerUserInteractionContext,
  SignInIdentifier,
  VerificationType,
  type AccessTokenPayload,
  type ClientCredentialsPayload,
} from '@logto/schemas';

const standardTokenPayloadData = {
  jti: 'f1d3d2d1-1f2d-3d4e-5d6f-7d8a9d0e1d2',
  aud: 'http://localhost:3000/api/test',
  scope: 'read write',
  clientId: 'my_app',
};

export const accessTokenSample: AccessTokenPayload = {
  ...standardTokenPayloadData,
  accountId: 'uid_123',
  grantId: 'grant_123',
  gty: 'authorization_code',
  kind: 'AccessToken',
};

export const clientCredentialsTokenSample: ClientCredentialsPayload = {
  ...standardTokenPayloadData,
  kind: 'ClientCredentials',
};

export const clientCredentialsJwtCustomizerPayload = {
  script: '',
  environmentVariables: {
    foo: 'bar',
    API_KEY: '12345',
  },
  contextSample: {
    application: {
      id: 'my-app',
      name: 'My M2M App',
    },
  },
  tokenSample: clientCredentialsTokenSample,
};

export const accessTokenJwtCustomizerPayload = {
  ...clientCredentialsJwtCustomizerPayload,
  tokenSample: accessTokenSample,
  contextSample: {
    user: {
      id: '123',
      username: 'foo',
      primaryEmail: 'foo@logto.io',
      primaryPhone: '+1234567890',
      name: 'Foo Bar',
      avatar: 'https://example.com/avatar.png',
      customData: {},
      identities: {},
      profile: {},
      applicationId: 'my-app',
      ssoIdentities: [],
      mfaVerificationFactors: [],
      roles: [],
      organizations: [],
      organizationRoles: [],
    },
    interaction: {
      interactionEvent: InteractionEvent.SignIn,
      userId: '123',
      verificationRecords: [
        {
          id: 'verification_123',
          type: VerificationType.Password,
          identifier: {
            type: SignInIdentifier.Email,
            value: 'foo@example.com',
          },
          verified: true,
        },
      ],
    } satisfies JwtCustomizerUserInteractionContext,
  },
};

export const accessTokenSampleScript = `const getCustomJwtClaims = async ({ token, context, environmentVariables }) => {
  const { interaction } = context;

  const verificationRecord = interaction?.verificationRecords?.[0];

  return { user_id: context?.user?.id ?? 'unknown', hasPassword: context?.user?.hasPassword, interactionEvent: interaction?.interactionEvent, verificationType: verificationRecord?.type };
};`;

export const accessTokenAccessDeniedSampleScript = `const getCustomJwtClaims = async ({ token, context, environmentVariables, api }) => {
  return api.denyAccess('You are not allowed to access this resource');
};`;

export const clientCredentialsSampleScript = `const getCustomJwtClaims = async ({ token, context, environmentVariables }) => {
  return { ...environmentVariables };
}`;

export const clientCredentialsAccessDeniedSampleScript = `const getCustomJwtClaims = async ({ token, context, environmentVariables, api }) => {
  return api.denyAccess('You are not allowed to access this resource');
};`;
