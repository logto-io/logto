export const clientCredentialsJwtCustomizerPayload = {
  script: '',
  envVars: {},
  contextSample: {},
};

export const accessTokenJwtCustomizerPayload = {
  ...clientCredentialsJwtCustomizerPayload,
  contextSample: {
    user: {
      username: 'test',
      id: 'fake-id',
    },
  },
};
