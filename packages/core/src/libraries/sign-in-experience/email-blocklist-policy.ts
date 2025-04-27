import { type EmailBlocklistPolicy } from '@logto/schemas';
import { deduplicate } from '@silverhand/essentials';

import RequestError from '../../errors/RequestError/index.js';

const emailOrEmailDomainRegex = /^\S+@\S+\.\S+|^@\S+\.\S+$/;

const validateCustomBlockList = (list: string[]) => {
  const invalidItems = new Set();

  for (const item of list) {
    if (!emailOrEmailDomainRegex.test(item)) {
      invalidItems.add(item);
    }
  }

  return invalidItems;
};

export const validateEmailBlocklistPolicy = (emailBlocklistPolicy: EmailBlocklistPolicy) => {
  const { customBlocklist = [] } = emailBlocklistPolicy;
  const invalidItems = validateCustomBlockList(customBlocklist);

  if (invalidItems.size > 0) {
    throw new RequestError({
      code: 'sign_in_experiences.invalid_custom_email_blocklist_format',
      items: Array.from(invalidItems),
      status: 400,
    });
  }

  const deduplicateList = deduplicate(customBlocklist);

  if (deduplicateList.length !== customBlocklist.length) {
    throw new RequestError('sign_in_experiences.duplicate_custom_email_blocklist_items');
  }
};
