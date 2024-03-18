import { emailRegEx } from '@logto/core-kit';
import { conditional, conditionalArray, conditionalString } from '@silverhand/essentials';
import { t as globalTranslate } from 'i18next';

import { type InviteeEmailItem } from '../types';

export const emailOptionsParser = (
  inputValues: InviteeEmailItem[]
): {
  values: InviteeEmailItem[];
  errorMessage?: string;
} => {
  const { duplicatedEmails, invalidEmails } = findDuplicatedOrInvalidEmails(
    inputValues.map((email) => email.value)
  );
  // Show error message and update the inputs' status for error display.
  if (duplicatedEmails.size > 0 || invalidEmails.size > 0) {
    return {
      values: inputValues.map(({ status, ...rest }) => ({
        ...rest,
        ...conditional(
          (duplicatedEmails.has(rest.value) || invalidEmails.has(rest.value)) && {
            status: 'info',
          }
        ),
      })),
      errorMessage: conditionalArray(
        conditionalString(
          duplicatedEmails.size > 0 &&
            globalTranslate('admin_console.tenant_members.errors.user_exists')
        ),
        conditionalString(
          invalidEmails.size > 0 &&
            globalTranslate('admin_console.tenant_members.errors.invalid_email')
        )
      ).join(' '),
    };
  }

  return { values: inputValues };
};

/**
 * Find duplicated and invalid formatted email addresses.
 *
 * @param emails Array of email emails.
 * @returns
 */
const findDuplicatedOrInvalidEmails = (emails: string[] = []) => {
  const duplicatedEmails = new Set<string>();
  const invalidEmails = new Set<string>();
  const validEmails = new Set<string>();

  for (const email of emails) {
    if (!emailRegEx.test(email)) {
      invalidEmails.add(email);
    }

    if (validEmails.has(email)) {
      duplicatedEmails.add(email);
    }
  }

  return {
    duplicatedEmails,
    invalidEmails,
  };
};
