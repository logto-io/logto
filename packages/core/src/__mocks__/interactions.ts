export const interactionMocks = [
  {
    input: {
      username: 'username',
      password: 'password',
    },
    output: {
      type: 'username_password',
      username: 'username',
      password: 'password',
    },
  },
  {
    input: {
      email: 'email',
      password: 'password',
    },
    output: {
      type: 'email_password',
      email: 'email',
      password: 'password',
    },
  },
  {
    input: {
      phone: 'phone',
      password: 'password',
    },
    output: {
      type: 'phone_password',
      phone: 'phone',
      password: 'password',
    },
  },
  {
    input: {
      email: 'email@logto.io',
      passcode: 'passcode',
    },
    output: {
      type: 'email_passcode',
      email: 'email@logto.io',
      passcode: 'passcode',
    },
  },
  {
    input: {
      phone: '123456',
      passcode: 'passcode',
    },
    output: {
      type: 'phone_passcode',
      phone: '123456',
      passcode: 'passcode',
    },
  },
  {
    input: {
      connectorId: 'connectorId',
      data: { code: 'code' },
    },
    output: {
      type: 'social',
      connectorId: 'connectorId',
      data: { code: 'code' },
    },
  },
];
