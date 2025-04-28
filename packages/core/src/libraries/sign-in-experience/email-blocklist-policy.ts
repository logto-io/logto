import { emailOrEmailDomainRegex } from '@logto/core-kit';
import { type EmailBlocklistPolicy } from '@logto/schemas';
import { conditional, deduplicate } from '@silverhand/essentials';

import { EnvSet } from '../../env-set/index.js';
import RequestError from '../../errors/RequestError/index.js';
import assertThat from '../../utils/assert-that.js';

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
