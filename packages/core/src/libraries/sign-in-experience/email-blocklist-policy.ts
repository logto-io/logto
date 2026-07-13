import { isEmailBlocklistItem, matchesEmailBlocklistItem } from '@logto/core-kit';
import { type EmailBlocklistPolicy } from '@logto/schemas';
import { conditional, deduplicate } from '@silverhand/essentials';
import { got } from 'got';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

const validateCustomEmailListFormat = (list: string[]) => {
  const invalidItems = new Set<string>();

  for (const item of list) {
    if (!isEmailBlocklistItem(item)) {
      invalidItems.add(item);
    }
  }

  return invalidItems;
};

const parseCustomEmailList = (list: string[]) => {
  const deduplicated = deduplicate(list);
  const invalidItems = validateCustomEmailListFormat(deduplicated);

  if (invalidItems.size > 0) {
    throw new RequestError({
      code: 'sign_in_experiences.invalid_custom_email_blocklist_format',
      items: Array.from(invalidItems),
      status: 400,
    });
  }

  return deduplicated;
};

/**
 * This function will deduplicate the custom blocklist and allowlist (if not undefined) and validate the format of each item.
 * If any item is invalid, it throws a RequestError with the details of the invalid items.
 */
export const parseEmailBlocklistPolicy = (
  emailBlocklistPolicy: EmailBlocklistPolicy
): EmailBlocklistPolicy => {
  const { customAllowlist, customBlocklist, ...rest } = emailBlocklistPolicy;

  // BlockDisposableAddresses is not supported for OSS.
  if (rest.blockDisposableAddresses) {
    assertThat(
      EnvSet.values.isCloud,
      new RequestError({
        code: 'request.invalid_input',
        details: 'Disposable email domain validation is not supported in this environment',
      })
    );
  }

  return {
    ...rest,
    ...conditional(customAllowlist && { customAllowlist: parseCustomEmailList(customAllowlist) }),
    ...conditional(customBlocklist && { customBlocklist: parseCustomEmailList(customBlocklist) }),
  };
};

const disposableEmailDomainValidationResponseGuard = z.object({
  isDisposable: z.boolean(),
});

const validateDisposableEmailDomain = async (email: string) => {
  // TODO: Skip the validation for integration test for now
  if (EnvSet.values.isIntegrationTest || EnvSet.values.isUnitTest) {
    return;
  }

  try {
    assertThat(
      EnvSet.values.azureFunctionAppEndpoint,
      new Error('Environment variable AZURE_FUNCTION_APP_ENDPOINT is not set')
    );

    const result = await got
      .post(
        new URL('/api/disposable-email-domain-validation', EnvSet.values.azureFunctionAppEndpoint),
        {
          json: {
            email,
          },
          headers: {
            'x-functions-key': EnvSet.values.azureFunctionAppKey,
          },
        }
      )
      .json<unknown>();

    const { isDisposable } = disposableEmailDomainValidationResponseGuard.parse(result);

    assertThat(
      !isDisposable,
      new RequestError({
        code: 'session.email_blocklist.email_not_allowed',
        status: 422,
        email,
      })
    );
  } catch (error: unknown) {
    if (error instanceof RequestError) {
      throw error;
    }

    throw new RequestError({
      code: 'session.email_blocklist.disposable_email_validation_failed',
      status: 500,
      error,
    });
  }
};

/**
 * Guard the email address is not in the sign-in experience blocklist. *
 *
 * @remarks
 * - guard disposable email domain if enabled
 * - guard email subaddessing if enabled
 * - guard custom email address/domain if provided
 *
 * @remarks
 * This validation should be applied to all the client email profile fullment flow.
 * - experience API
 * - account API
 */
export const validateEmailAgainstBlocklistPolicy = async (
  emailBlocklistPolicy: EmailBlocklistPolicy,
  email: string
) => {
  const { customBlocklist, blockDisposableAddresses, blockSubaddressing } = emailBlocklistPolicy;
  const domain = email.split('@')[1];

  assertThat(domain, new RequestError('session.email_blocklist.invalid_email'));

  // Guard email subaddressing if enabled
  if (blockSubaddressing) {
    // Subaddressing puts a `+` in the local part (e.g. `user+tag@example.com`). Check the local
    // part directly instead of building a `RegExp` from the user-controlled domain — a plain
    // string check is simpler and avoids interpreting user input as a pattern.
    const localPart = email.split('@')[0] ?? '';
    assertThat(
      !localPart.includes('+'),
      new RequestError({
        code: 'session.email_blocklist.email_subaddressing_not_allowed',
        status: 422,
      })
    );
  }

  // Guard custom email address/domain if provided
  if (customBlocklist) {
    const isCustomBlocklisted = customBlocklist.some((item) =>
      matchesEmailBlocklistItem(item, email)
    );

    assertThat(
      !isCustomBlocklisted,
      new RequestError({
        code: 'session.email_blocklist.email_not_allowed',
        status: 422,
        email,
      })
    );
  }

  // Guard disposable email domain if enabled
  if (blockDisposableAddresses) {
    await validateDisposableEmailDomain(email);
  }
};

export const isEmailBlocklistPolicyEnabled = (emailBlockListPolicy: EmailBlocklistPolicy) => {
  const { blockDisposableAddresses, blockSubaddressing, customAllowlist, customBlocklist } =
    emailBlockListPolicy;

  return [
    blockDisposableAddresses === true,
    blockSubaddressing === true,
    (customAllowlist?.length ?? 0) > 0,
    (customBlocklist?.length ?? 0) > 0,
  ].some(Boolean);
};
