import { findDuplicatedOrBlockedEmailDomains } from '@logto/schemas';
import { conditional, conditionalArray, conditionalString } from '@silverhand/essentials';
import { t as globalTranslate } from 'i18next';

import { type Props as TagProps } from '@/ds-components/Tag';

import {
  domainRegExp,
  duplicatedDomainsErrorCode,
  forbiddenDomainsErrorCode,
  invalidDomainFormatErrorCode,
} from './consts';

export type Option = {
  /**
   * Generate a random unique id for each option to handle deletion.
   * Sometimes we may have options with the same value, which is allowed when inputting but prohibited when submitting.
   */
  id: string;
  value: string;
  /**
   * The `status` is used to indicate the status of the domain item (could fall into following categories):
   * - undefined: valid domain
   * - 'info': duplicated domain or blocked domain, see {@link packages/schemas/src/utils/domain.ts}.
   */
  status?: Extract<TagProps['status'], 'info'>;
};

export const domainOptionsParser = (
  inputValues: Option[]
): {
  values: Option[];
  errorMessage?: string;
} => {
  const { duplicatedDomains, forbiddenDomains } = findDuplicatedOrBlockedEmailDomains(
    inputValues.map((domain) => domain.value)
  );
  const isAnyDomainInvalid = inputValues.some(({ value }) => !domainRegExp.test(value));

  // Show error message and update the inputs' status for error display.
  if (duplicatedDomains.size > 0 || forbiddenDomains.size > 0 || isAnyDomainInvalid) {
    return {
      values: inputValues.map(({ status, ...rest }) => ({
        ...rest,
        ...conditional(
          (duplicatedDomains.has(rest.value) ||
            forbiddenDomains.has(rest.value) ||
            !domainRegExp.test(rest.value)) && {
            status: 'info',
          }
        ),
      })),
      errorMessage: conditionalArray(
        conditionalString(
          duplicatedDomains.size > 0 && globalTranslate(`errors:${duplicatedDomainsErrorCode}`)
        ),
        conditionalString(
          forbiddenDomains.size > 0 && globalTranslate(`errors:${forbiddenDomainsErrorCode}`)
        ),
        conditionalString(
          isAnyDomainInvalid && globalTranslate(`errors:${invalidDomainFormatErrorCode}`)
        )
      ).join(' '),
    };
  }

  return { values: inputValues };
};
