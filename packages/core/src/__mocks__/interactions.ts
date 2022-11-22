export const interactionMocks = [
  {
    input: {
      username: 'username',
      password: 'password',
    },
    output: {
      identity: {
        type: 'username',
        value: 'username',
      },
      verification: {
        type: 'password',
        value: 'password',
      },
    },
  },
  {
    input: {
      email: 'email',
      password: 'password',
    },
    output: {
      identity: {
        type: 'email',
        value: 'email',
      },
      verification: {
        type: 'password',
        value: 'password',
      },
    },
  },
  {
    input: {
      phone: 'phone',
      password: 'password',
    },
    output: {
      identity: {
        type: 'phone',
        value: 'phone',
      },
      verification: {
        type: 'password',
        value: 'password',
      },
    },
  },
  {
    input: {
      email: 'email@logto.io',
      passcode: 'passcode',
    },
    output: {
      identity: {
        type: 'email',
        value: 'email@logto.io',
      },
      verification: {
        type: 'passcode',
        value: 'passcode',
      },
    },
  },
  {
    input: {
      phone: '123456',
      passcode: 'passcode',
    },
    output: {
      identity: {
        type: 'phone',
        value: '123456',
      },
      verification: {
        type: 'passcode',
        value: 'passcode',
      },
    },
  },
  {
    input: {
      connectorId: 'connectorId',
      data: { code: 'code' },
    },
    output: {
      identity: {
        type: 'connectorId',
        value: 'connectorId',
      },
      verification: {
        type: 'social',
        value: { code: 'code' },
      },
    },
  },
];
