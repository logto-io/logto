import { LogtoJwtTokenKey } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import deepmerge from 'deepmerge';

describe('Test the deploy custom JWT script', () => {
  describe('Test script when both AccessToken & ClientCredentials scripts are working', () => {
    it.each(Object.values(LogtoJwtTokenKey))('test %s script', (key) => {
      expect(
        deepmerge(
          {
            [LogtoJwtTokenKey.AccessToken]: {
              production: `${LogtoJwtTokenKey.AccessToken}-production`,
            },
            [LogtoJwtTokenKey.ClientCredentials]: {
              production: `${LogtoJwtTokenKey.ClientCredentials}-production`,
            },
          },
          {
            [key]: {
              test: `${key}-test`,
            },
          }
        )
      ).toEqual({
        [LogtoJwtTokenKey.AccessToken]: {
          production: `${LogtoJwtTokenKey.AccessToken}-production`,
          ...cond(key === LogtoJwtTokenKey.AccessToken && { test: `${key}-test` }),
        },
        [LogtoJwtTokenKey.ClientCredentials]: {
          production: `${LogtoJwtTokenKey.ClientCredentials}-production`,
          ...cond(key === LogtoJwtTokenKey.ClientCredentials && { test: `${key}-test` }),
        },
      });
    });
  });

  describe('Test script:', () => {
    // Test it.each() can not be nested, so we have to test each key separately.
    it.each(Object.values(LogtoJwtTokenKey))(
      `when ${LogtoJwtTokenKey.AccessToken} script is working, test $s script`,
      (testingKey) => {
        const workingKey = LogtoJwtTokenKey.AccessToken;
        const workingScript = {
          [workingKey]: {
            production: `${workingKey}-production`,
          },
        };
        expect(
          deepmerge(workingScript, {
            [testingKey]: {
              test: `${testingKey}-test`,
            },
          })
        ).toEqual(
          workingKey === testingKey
            ? {
                [workingKey]: {
                  production: `${workingKey}-production`,
                  test: `${workingKey}-test`,
                },
              }
            : {
                [workingKey]: {
                  production: `${workingKey}-production`,
                },
                [testingKey]: {
                  test: `${testingKey}-test`,
                },
              }
        );
      }
    );

    it.each(Object.values(LogtoJwtTokenKey))(
      `when ${LogtoJwtTokenKey.ClientCredentials} script is working, test $s script`,
      (testingKey) => {
        const workingKey = LogtoJwtTokenKey.ClientCredentials;
        const workingScript = {
          [workingKey]: {
            production: `${workingKey}-production`,
          },
        };
        expect(
          deepmerge(workingScript, {
            [testingKey]: {
              test: `${testingKey}-test`,
            },
          })
        ).toEqual(
          workingKey === testingKey
            ? {
                [workingKey]: {
                  production: `${workingKey}-production`,
                  test: `${workingKey}-test`,
                },
              }
            : {
                [workingKey]: {
                  production: `${workingKey}-production`,
                },
                [testingKey]: {
                  test: `${testingKey}-test`,
                },
              }
        );
      }
    );
  });

  describe('Test script when both AccessToken & ClientCredentials scripts are not working', () => {
    it.each(Object.values(LogtoJwtTokenKey))('test %s script', (key) => {
      expect(
        deepmerge(
          {},
          {
            [key]: `${key}-test`,
          }
        )
      ).toEqual({
        [key]: `${key}-test`,
      });
    });
  });
});

describe('Test deploy custom JWT script', () => {
  describe('Deploy script when both AccessToken & ClientCredentials scripts are working', () => {
    it.each(Object.values(LogtoJwtTokenKey))('deploy %s script', (key) => {
      expect(
        deepmerge(
          {
            [LogtoJwtTokenKey.AccessToken]: {
              production: `${LogtoJwtTokenKey.AccessToken}-production`,
            },
            [LogtoJwtTokenKey.ClientCredentials]: {
              production: `${LogtoJwtTokenKey.ClientCredentials}-production`,
            },
          },
          {
            [key]: {
              production: `${key}-production-new`,
            },
          }
        )
      ).toEqual({
        [LogtoJwtTokenKey.AccessToken]: {
          production: `${LogtoJwtTokenKey.AccessToken}-production${
            key === LogtoJwtTokenKey.AccessToken ? '-new' : ''
          }`,
        },
        [LogtoJwtTokenKey.ClientCredentials]: {
          production: `${LogtoJwtTokenKey.ClientCredentials}-production${
            key === LogtoJwtTokenKey.ClientCredentials ? '-new' : ''
          }`,
        },
      });
    });
  });

  describe('Deploy script:', () => {
    // Test it.each() can not be nested, so we have to test each key separately.
    it.each(Object.values(LogtoJwtTokenKey))(
      `when ${LogtoJwtTokenKey.AccessToken} script is working, deploy $s script`,
      (deployingKey) => {
        const workingKey = LogtoJwtTokenKey.AccessToken;
        const workingScript = {
          [workingKey]: {
            production: `${workingKey}-production`,
          },
        };
        expect(
          deepmerge(workingScript, {
            [deployingKey]: {
              production: `${deployingKey}-production-new`,
            },
          })
        ).toEqual(
          workingKey === deployingKey
            ? {
                [workingKey]: {
                  production: `${workingKey}-production-new`,
                },
              }
            : {
                [workingKey]: {
                  production: `${workingKey}-production`,
                },
                [deployingKey]: {
                  production: `${deployingKey}-production-new`,
                },
              }
        );
      }
    );

    it.each(Object.values(LogtoJwtTokenKey))(
      `when ${LogtoJwtTokenKey.ClientCredentials} script is working, deploy $s script`,
      (deployingKey) => {
        const workingKey = LogtoJwtTokenKey.ClientCredentials;
        const workingScript = {
          [workingKey]: {
            production: `${workingKey}-production`,
          },
        };
        expect(
          deepmerge(workingScript, {
            [deployingKey]: {
              production: `${deployingKey}-production-new`,
            },
          })
        ).toEqual(
          workingKey === deployingKey
            ? {
                [workingKey]: {
                  production: `${workingKey}-production-new`,
                },
              }
            : {
                [workingKey]: {
                  production: `${workingKey}-production`,
                },
                [deployingKey]: {
                  production: `${deployingKey}-production-new`,
                },
              }
        );
      }
    );
  });

  describe('Deploy script when both AccessToken & ClientCredentials scripts are not working', () => {
    it.each(Object.values(LogtoJwtTokenKey))('deploy %s script', (key) => {
      expect(
        deepmerge(
          {},
          {
            [key]: {
              production: `${key}-production-new`,
            },
          }
        )
      ).toEqual({
        [key]: {
          production: `${key}-production-new`,
        },
      });
    });
  });
});

describe('Test undeploy custom JWT script', () => {
  describe('Undeploy script when both AccessToken & ClientCredentials scripts are working', () => {
    it.each(Object.values(LogtoJwtTokenKey))('undeploy %s script', (key) => {
      expect(
        deepmerge(
          {
            [LogtoJwtTokenKey.AccessToken]: {
              production: `${LogtoJwtTokenKey.AccessToken}-production`,
            },
            [LogtoJwtTokenKey.ClientCredentials]: {
              production: `${LogtoJwtTokenKey.ClientCredentials}-production`,
            },
          },
          {
            [key]: {
              production: undefined,
            },
          }
        )
      ).toEqual({
        [LogtoJwtTokenKey.AccessToken]: {
          production:
            key === LogtoJwtTokenKey.AccessToken
              ? undefined
              : `${LogtoJwtTokenKey.AccessToken}-production`,
        },
        [LogtoJwtTokenKey.ClientCredentials]: {
          production:
            key === LogtoJwtTokenKey.ClientCredentials
              ? undefined
              : `${LogtoJwtTokenKey.ClientCredentials}-production`,
        },
      });
    });
  });

  describe('Undeploy script:', () => {
    // Test it.each() can not be nested, so we have to test each key separately.
    it.each(Object.values(LogtoJwtTokenKey))(
      `when ${LogtoJwtTokenKey.AccessToken} script is working, undeploy $s script`,
      (undeployingKey) => {
        const workingKey = LogtoJwtTokenKey.AccessToken;
        const workingScript = {
          [workingKey]: {
            production: `${workingKey}-production`,
          },
        };
        expect(
          deepmerge(workingScript, {
            [undeployingKey]: {
              production: undefined,
            },
          })
        ).toEqual(
          workingKey === undeployingKey
            ? {
                [workingKey]: {
                  production: undefined,
                },
              }
            : {
                [workingKey]: {
                  production: `${workingKey}-production`,
                },
                [undeployingKey]: {
                  production: undefined,
                },
              }
        );
      }
    );

    it.each(Object.values(LogtoJwtTokenKey))(
      `when ${LogtoJwtTokenKey.ClientCredentials} script is working, undeploy $s script`,
      (undeployingKey) => {
        const workingKey = LogtoJwtTokenKey.ClientCredentials;
        const workingScript = {
          [workingKey]: {
            production: `${workingKey}-production`,
          },
        };
        expect(
          deepmerge(workingScript, {
            [undeployingKey]: {
              production: undefined,
            },
          })
        ).toEqual(
          workingKey === undeployingKey
            ? {
                [workingKey]: {
                  production: undefined,
                },
              }
            : {
                [workingKey]: {
                  production: `${workingKey}-production`,
                },
                [undeployingKey]: {
                  production: undefined,
                },
              }
        );
      }
    );
  });
});
