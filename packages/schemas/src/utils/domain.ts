import { singleSignOnDomainBlackList } from '../types/sso-connector.js';

/**
 * Find duplicated domains and blocked domains using the domain blacklist.
 *
 * @param domains Array of email domains.
 * @returns
 */
export const findDuplicatedOrBlockedEmailDomains = (domains?: string[]) => {
  const blackListSet = new Set<string>(singleSignOnDomainBlackList);
  const validDomainSet = new Set<string>();
  const duplicatedDomains = new Set<string>();
  const forbiddenDomains = new Set<string>();

  for (const domain of domains ?? []) {
    if (blackListSet.has(domain)) {
      forbiddenDomains.add(domain);
    }

    if (validDomainSet.has(domain)) {
      duplicatedDomains.add(domain);
    } else {
      validDomainSet.add(domain);
    }
  }

  return {
    duplicatedDomains,
    forbiddenDomains,
  };
};
