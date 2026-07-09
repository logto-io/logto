import { type EmailBlocklistPolicy } from '@logto/schemas';
import { deduplicate } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';

import {
  parseEmailBlocklistPolicy,
  validateEmailAgainstBlocklistPolicy,
  isEmailBlocklistPolicyEnabled,
} from './email-blocklist-policy.js';

const invalidCustomBlockList = ['bar', 'bar@foo', '@foo', '@foo.', 'bar@foo.'];
const validCustomBlockList = ['bar@foo.com', '@foo.com', 'abc.bar@foo.xyz', 'bar@foo.com'];

describe('parseEmailBlocklistPolicy', () => {
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

  it('should allow wildcard items', () => {
    const customBlocklist = ['foo*@bar.com', '*@example.com', '@foo.*', '@*.example.com'];
    const parsed = parseEmailBlocklistPolicy({ customBlocklist });

    expect(parsed).toEqual({ customBlocklist });
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

  it('blocks subaddressing regardless of regex metacharacters in the address', async () => {
    // The local part contains `+`, so it is blocked as subaddressing no matter what other
    // characters appear in the address; the check treats the address as plain text, not a pattern,
    // so it stays linear-time.
    const complexEmail = 'x+y@(a+)+$@' + 'a'.repeat(40) + '.com';
    const start = Date.now();
    await expect(
      validateEmailAgainstBlocklistPolicy(emailBlocklistPolicy, complexEmail)
    ).rejects.toMatchError(
      new RequestError({
        code: 'session.email_blocklist.email_subaddressing_not_allowed',
        status: 422,
      })
    );
    expect(Date.now() - start).toBeLessThan(1000);
  });

  it('should throw if the email domain is in the custom blocklist', async () => {
    const emails = ['test@foo.com', 'bar@Foo.com'];

    for (const email of emails) {
      // eslint-disable-next-line no-await-in-loop -- each assertion needs the current email in the expected error
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
    const email = 'Foo@Bar.com';
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

  it('should throw if the email address matches a wildcard custom blocklist item', async () => {
    const policy: EmailBlocklistPolicy = {
      customBlocklist: ['foo*@bar.com', '@*.example.com'],
    };
    const emails = ['FooBar@bar.com', 'test@Foo.example.com'];

    for (const email of emails) {
      // eslint-disable-next-line no-await-in-loop -- each assertion needs the current email in the expected error
      await expect(validateEmailAgainstBlocklistPolicy(policy, email)).rejects.toMatchError(
        new RequestError({
          code: 'session.email_blocklist.email_not_allowed',
          status: 422,
          email,
        })
      );
    }
  });

  it('should pass the blocklist policy validation', async () => {
    await expect(
      validateEmailAgainstBlocklistPolicy(emailBlocklistPolicy, 'test@bar.com')
    ).resolves.not.toThrow();
  });
});

describe('isEmailBlocklistPolicyEnabled', () => {
  it('isEmailBlocklistPolicyEnabled should return true if any of the blocklist policies are enabled', () => {
    const emailBlocklistPolicy: EmailBlocklistPolicy = {
      blockDisposableAddresses: false,
      blockSubaddressing: false,
      customBlocklist: [],
    };

    expect(
      isEmailBlocklistPolicyEnabled({
        ...emailBlocklistPolicy,
        blockDisposableAddresses: true,
      })
    ).toBe(true);

    expect(
      isEmailBlocklistPolicyEnabled({
        ...emailBlocklistPolicy,
        blockSubaddressing: true,
      })
    ).toBe(true);

    expect(
      isEmailBlocklistPolicyEnabled({
        ...emailBlocklistPolicy,
        customBlocklist: ['@bar.com'],
      })
    ).toBe(true);
  });

  it('isEmailBlocklistPolicyEnabled should return false if all blocklist policies are disabled', () => {
    const emailBlocklistPolicy: EmailBlocklistPolicy = {
      blockDisposableAddresses: false,
      blockSubaddressing: false,
      customBlocklist: [],
    };

    expect(isEmailBlocklistPolicyEnabled(emailBlocklistPolicy)).toBe(false);
  });
});
