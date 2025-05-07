import { emailOrEmailDomainRegex } from '@logto/core-kit';
import { type EmailBlocklistPolicy } from '@logto/schemas';
import { conditional, deduplicate } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

const validateCustomBlockListFormat = (list: string[]) => {
  const invalidItems = new Set();

  for (const item of list) {
    if (!emailOrEmailDomainRegex.test(item)) {
      invalidItems.add(item);
    }
  }

  return invalidItems;
};

const parseCustomBlocklist = (customBlocklist: string[]) => {
  const deduplicated = deduplicate(customBlocklist);
  const invalidItems = validateCustomBlockListFormat(deduplicated);

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
 * This function will deduplicate the custom blocklist (if not undefined) and validate the format of each item.
 * If any item is invalid, it throws a RequestError with the details of the invalid items.
 */
export const parseEmailBlocklistPolicy = (
  emailBlocklistPolicy: EmailBlocklistPolicy
): EmailBlocklistPolicy => {
  // TODO: @simeng remove this validation when the feature is ready
  assertThat(
    EnvSet.values.isDevFeaturesEnabled,
    new RequestError('request.invalid_input', {
      details: 'Email block list policy is not supported in this environment',
    })
  );

  const { customBlocklist, ...rest } = emailBlocklistPolicy;

  return {
    ...rest,
    ...conditional(customBlocklist && { customBlocklist: parseCustomBlocklist(customBlocklist) }),
  };
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

  // Guard disposable email domain if enabled
  if (EnvSet.values.isCloud && blockDisposableAddresses) {
    // TODO: call Azure function
  }

  // Guard email subaddressing if enabled
  if (blockSubaddressing) {
    const subaddressingRegex = new RegExp(`^.*\\+.*@${domain}$`);
    assertThat(
      !subaddressingRegex.test(email),
      new RequestError({
        code: 'session.email_blocklist.email_subaddressing_not_allowed',
        status: 422,
      })
    );
  }

  // Guard custom email address/domain if provided
  if (customBlocklist) {
    const isCustomBlocklisted = customBlocklist.some((item) => {
      // Guard email domain
      if (item.startsWith('@')) {
        return domain === item.slice(1);
      }

      return email === item;
    });

    assertThat(
      !isCustomBlocklisted,
      new RequestError({
        code: 'session.email_blocklist.email_not_allowed',
        status: 422,
        email,
      })
    );
  }
};
