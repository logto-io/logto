import { type EmailBlocklistPolicy } from '@logto/schemas';
import { deduplicate } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';

import {
  parseEmailBlocklistPolicy,
  validateEmailAgainstBlocklistPolicy,
} from './email-blocklist-policy.js';

const invalidCustomBlockList = ['bar', 'bar@foo', '@foo', '@foo.', 'bar@foo.'];
const validCustomBlockList = ['bar@foo.com', '@foo.com', 'abc.bar@foo.xyz', 'bar@foo.com'];

describe('validateEmailBlocklistPolicy', () => {
  it.each(invalidCustomBlockList)(
    'should throw error for invalid custom block list item: %s',
    (item) => {
      const emailBlocklistPolicy = { customBlocklist: [item] };
      expect(() => {
        parseEmailBlocklistPolicy(emailBlocklistPolicy);
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.invalid_custom_email_blocklist_format',
          items: Array.from([item]),
          status: 400,
        })
      );
    }
  );

  it('should pass the validation with valid format and deduplicate items', () => {
    const parsed = parseEmailBlocklistPolicy({ customBlocklist: validCustomBlockList });
    expect(parsed).toEqual({ customBlocklist: deduplicate(validCustomBlockList) });
  });
});

describe('validateEmailAgainstBlocklistPolicy', () => {
  const emailBlocklistPolicy: EmailBlocklistPolicy = {
    blockDisposableAddresses: true,
    blockSubaddressing: true,
    customBlocklist: ['foo@bar.com', '@foo.com'],
  };

  it('should throw if the email uses subaddressing', async () => {
    await expect(
      validateEmailAgainstBlocklistPolicy(emailBlocklistPolicy, 'foo+1@bar.com')
    ).rejects.toMatchError(
      new RequestError({
        code: 'session.email_blocklist.email_subaddressing_not_allowed',
        status: 422,
      })
    );
  });

  it('should throw if the email domain is in the custom blocklist', async () => {
    const emails = ['test@foo.com', 'bar@foo.com'];

    for (const email of emails) {
      // eslint-disable-next-line no-await-in-loop
      await expect(
        validateEmailAgainstBlocklistPolicy(emailBlocklistPolicy, email)
      ).rejects.toMatchError(
        new RequestError({
          code: 'session.email_blocklist.email_not_allowed',
          status: 422,
          email,
        })
      );
    }
  });

  it('should throw if the email address is in the custom blocklist', async () => {
    const email = 'foo@bar.com';
    await expect(
      validateEmailAgainstBlocklistPolicy(emailBlocklistPolicy, email)
    ).rejects.toMatchError(
      new RequestError({
        code: 'session.email_blocklist.email_not_allowed',
        status: 422,
        email,
      })
    );
  });

  it('should pass the blocklist policy validation', async () => {
    await expect(
      validateEmailAgainstBlocklistPolicy(emailBlocklistPolicy, 'test@bar.com')
    ).resolves.not.toThrow();
  });
});
