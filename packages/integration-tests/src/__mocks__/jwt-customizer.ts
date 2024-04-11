export const clientCredentialsJwtCustomizerPayload = {
  script: '',
  environmentVariables: {},
  contextSample: {},
};

export const accessTokenJwtCustomizerPayload = {
  ...clientCredentialsJwtCustomizerPayload,
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
  },
};
