import type { SignInIdentifier } from '@logto/schemas';
import { detailedDiff } from 'deep-object-diff';
import get from 'lodash.get';
import { useTranslation } from 'react-i18next';

import type { SignInMethod } from '../SignInMethodEditBox/types';
import DiffSegment from './DiffSegment';
import * as styles from './index.module.scss';
import { convertToSignInMethodsObject } from './utilities';

type Props = {
  before: SignInMethod[];
  after: SignInMethod[];
  isAfter?: boolean;
};

const stringCompareFunction = (leftValue: string, rightValue: string) =>
  leftValue === rightValue ? 0 : leftValue > rightValue ? 1 : -1;

const SignInDiffSection = ({ before, after, isAfter = false }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const beforeSignInMethodsObject = convertToSignInMethodsObject(
    before
      .slice()
      .sort(({ identifier: leftIdentifier }, { identifier: rightIdentifier }) =>
        stringCompareFunction(leftIdentifier, rightIdentifier)
      )
  );

  const afterSignInMethodsObject = convertToSignInMethodsObject(
    after
      .slice()
      .sort(({ identifier: leftIdentifier }, { identifier: rightIdentifier }) =>
        stringCompareFunction(leftIdentifier, rightIdentifier)
      )
  );

  const signInDiff = isAfter
    ? detailedDiff(beforeSignInMethodsObject, afterSignInMethodsObject)
    : detailedDiff(afterSignInMethodsObject, beforeSignInMethodsObject);

  const displaySignInMethodsObject = isAfter ? afterSignInMethodsObject : beforeSignInMethodsObject;

  const hasIdentifierChanged = (identifierKey: string) =>
    get(signInDiff, `added.${identifierKey}`) !== undefined;

  const hasAuthenticationChanged = (identifierKey: string, authenticationKey: string) =>
    get(signInDiff, `updated.${identifierKey}.${authenticationKey}`) !== undefined;

  return (
    <div>
      <div className={styles.title}>{t('sign_in_exp.save_alert.sign_in')}</div>
      <ul className={styles.list}>
        {
          // eslint-disable-next-line no-restricted-syntax
          (Object.keys(displaySignInMethodsObject) as SignInIdentifier[]).map((identifierKey) => {
            const { password, verificationCode } = displaySignInMethodsObject[identifierKey];
            const hasAuthentication = password || verificationCode;
            const needDisjunction = password && verificationCode;

            return (
              <li key={identifierKey}>
                <DiffSegment hasChanged={hasIdentifierChanged(identifierKey)} isAfter={isAfter}>
                  {t('sign_in_exp.sign_up_and_sign_in.identifiers', {
                    context: identifierKey.toLocaleLowerCase(),
                  })}
                  {hasAuthentication && ' ('}
                  {password && (
                    <DiffSegment
                      hasChanged={hasAuthenticationChanged(identifierKey, 'password')}
                      isAfter={isAfter}
                    >
                      {t('sign_in_exp.sign_up_and_sign_in.sign_in.password_auth')}
                    </DiffSegment>
                  )}
                  {needDisjunction && ` ${String(t('sign_in_exp.sign_up_and_sign_in.or'))} `}
                  {verificationCode && (
                    <DiffSegment
                      hasChanged={hasAuthenticationChanged(identifierKey, 'verificationCode')}
                      isAfter={isAfter}
                    >
                      {t('sign_in_exp.sign_up_and_sign_in.sign_in.verification_code_auth')}
                    </DiffSegment>
                  )}
                  {hasAuthentication && ')'}
                </DiffSegment>
              </li>
            );
          })
        }
      </ul>
    </div>
  );
};

export default SignInDiffSection;
