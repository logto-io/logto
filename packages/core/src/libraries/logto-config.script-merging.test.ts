import { LogtoJwtTokenKey } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import deepmerge from 'deepmerge';

describe('Test the deploy custom JWT script', () => {
  describe('Test script when both AccessToken & ClientCredentials scripts are existing', () => {
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
      `when ${LogtoJwtTokenKey.AccessToken} script is existing, test $s script`,
      (testingKey) => {
        const existingKey = LogtoJwtTokenKey.AccessToken;
        const existingScript = {
          [existingKey]: {
            production: `${existingKey}-production`,
          },
        };
        expect(
          deepmerge(existingScript, {
            [testingKey]: {
              test: `${testingKey}-test`,
            },
          })
        ).toEqual(
          existingKey === testingKey
            ? {
                [existingKey]: {
                  production: `${existingKey}-production`,
                  test: `${existingKey}-test`,
                },
              }
            : {
                [existingKey]: {
                  production: `${existingKey}-production`,
                },
                [testingKey]: {
                  test: `${testingKey}-test`,
                },
              }
        );
      }
    );

    it.each(Object.values(LogtoJwtTokenKey))(
      `when ${LogtoJwtTokenKey.ClientCredentials} script is existing, test $s script`,
      (testingKey) => {
        const existingKey = LogtoJwtTokenKey.ClientCredentials;
        const existingScript = {
          [existingKey]: {
            production: `${existingKey}-production`,
          },
        };
        expect(
          deepmerge(existingScript, {
            [testingKey]: {
              test: `${testingKey}-test`,
            },
          })
        ).toEqual(
          existingKey === testingKey
            ? {
                [existingKey]: {
                  production: `${existingKey}-production`,
                  test: `${existingKey}-test`,
                },
              }
            : {
                [existingKey]: {
                  production: `${existingKey}-production`,
                },
                [testingKey]: {
                  test: `${testingKey}-test`,
                },
              }
        );
      }
    );
  });

  describe('Test script when both AccessToken & ClientCredentials scripts are not existing', () => {
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
  describe('Deploy script when both AccessToken & ClientCredentials scripts are existing', () => {
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
      `when ${LogtoJwtTokenKey.AccessToken} script is existing, deploy $s script`,
      (deployingKey) => {
        const existingKey = LogtoJwtTokenKey.AccessToken;
        const existingScript = {
          [existingKey]: {
            production: `${existingKey}-production`,
          },
        };
        expect(
          deepmerge(existingScript, {
            [deployingKey]: {
              production: `${deployingKey}-production-new`,
            },
          })
        ).toEqual(
          existingKey === deployingKey
            ? {
                [existingKey]: {
                  production: `${existingKey}-production-new`,
                },
              }
            : {
                [existingKey]: {
                  production: `${existingKey}-production`,
                },
                [deployingKey]: {
                  production: `${deployingKey}-production-new`,
                },
              }
        );
      }
    );

    it.each(Object.values(LogtoJwtTokenKey))(
      `when ${LogtoJwtTokenKey.ClientCredentials} script is existing, deploy $s script`,
      (deployingKey) => {
        const existingKey = LogtoJwtTokenKey.ClientCredentials;
        const existingScript = {
          [existingKey]: {
            production: `${existingKey}-production`,
          },
        };
        expect(
          deepmerge(existingScript, {
            [deployingKey]: {
              production: `${deployingKey}-production-new`,
            },
          })
        ).toEqual(
          existingKey === deployingKey
            ? {
                [existingKey]: {
                  production: `${existingKey}-production-new`,
                },
              }
            : {
                [existingKey]: {
                  production: `${existingKey}-production`,
                },
                [deployingKey]: {
                  production: `${deployingKey}-production-new`,
                },
              }
        );
      }
    );
  });

  describe('Deploy script when both AccessToken & ClientCredentials scripts are not existing', () => {
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
  describe('Undeploy script when both AccessToken & ClientCredentials scripts are existing', () => {
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
      `when ${LogtoJwtTokenKey.AccessToken} script is existing, undeploy $s script`,
      (undeployingKey) => {
        const existingKey = LogtoJwtTokenKey.AccessToken;
        const existingScript = {
          [existingKey]: {
            production: `${existingKey}-production`,
          },
        };
        expect(
          deepmerge(existingScript, {
            [undeployingKey]: {
              production: undefined,
            },
          })
        ).toEqual(
          existingKey === undeployingKey
            ? {
                [existingKey]: {
                  production: undefined,
                },
              }
            : {
                [existingKey]: {
                  production: `${existingKey}-production`,
                },
                [undeployingKey]: {
                  production: undefined,
                },
              }
        );
      }
    );

    it.each(Object.values(LogtoJwtTokenKey))(
      `when ${LogtoJwtTokenKey.ClientCredentials} script is existing, undeploy $s script`,
      (undeployingKey) => {
        const existingKey = LogtoJwtTokenKey.ClientCredentials;
        const existingScript = {
          [existingKey]: {
            production: `${existingKey}-production`,
          },
        };
        expect(
          deepmerge(existingScript, {
            [undeployingKey]: {
              production: undefined,
            },
          })
        ).toEqual(
          existingKey === undeployingKey
            ? {
                [existingKey]: {
                  production: undefined,
                },
              }
            : {
                [existingKey]: {
                  production: `${existingKey}-production`,
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
