import type { SignInIdentifier } from '@logto/schemas';
import { getSafe } from '@silverhand/essentials';
import { detailedDiff } from 'deep-object-diff';
import { useTranslation } from 'react-i18next';

import DynamicT from '@/ds-components/DynamicT';

import type { SignInMethod, SignInMethodsObject } from '../../../types';
import { signInIdentifierPhrase } from '../../constants';
import { convertToSignInMethodsObject } from '../../utils/form';

import DiffSegment from './DiffSegment';
import * as styles from './index.module.scss';

type Props = {
  readonly before: SignInMethod[];
  readonly after: SignInMethod[];
  readonly isAfter?: boolean;
};

function SignInDiffSection({ before, after, isAfter = false }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const beforeSignInMethodsObject = convertToSignInMethodsObject(before);
  const afterSignInMethodsObject = convertToSignInMethodsObject(after);

  const signInDiff = isAfter
    ? detailedDiff(beforeSignInMethodsObject, afterSignInMethodsObject)
    : detailedDiff(afterSignInMethodsObject, beforeSignInMethodsObject);

  const displaySignInMethodsObject = isAfter ? afterSignInMethodsObject : beforeSignInMethodsObject;

  const hasIdentifierChanged = (identifierKey: SignInIdentifier) =>
    getSafe(signInDiff, `added.${identifierKey.toLocaleLowerCase()}`) !== undefined;

  const hasAuthenticationChanged = (
    identifierKey: SignInIdentifier,
    authenticationKey: keyof SignInMethodsObject[SignInIdentifier]
  ) =>
    getSafe(signInDiff, `updated.${identifierKey.toLocaleLowerCase()}.${authenticationKey}`) !==
    undefined;

  // eslint-disable-next-line no-restricted-syntax
  const displayedIdentifiers = Object.keys(displaySignInMethodsObject)
    .slice()
    .sort() as SignInIdentifier[];

  return (
    <div>
      <div className={styles.title}>{t('sign_in_exp.save_alert.sign_in')}</div>
      <ul className={styles.list}>
        {displayedIdentifiers.map((identifierKey) => {
          const { password, verificationCode } = displaySignInMethodsObject[identifierKey];
          const hasAuthentication = password || verificationCode;
          const needDisjunction = password && verificationCode;

          return (
            <li key={identifierKey}>
              <DiffSegment hasChanged={hasIdentifierChanged(identifierKey)} isAfter={isAfter}>
                <DynamicT forKey={signInIdentifierPhrase[identifierKey]} />
                {hasAuthentication && ' ('}
                {password && (
                  <DiffSegment
                    hasChanged={hasAuthenticationChanged(identifierKey, 'password')}
                    isAfter={isAfter}
                  >
                    {t('sign_in_exp.sign_up_and_sign_in.sign_in.password_auth')}
                  </DiffSegment>
                )}
                {needDisjunction && ` ${t('sign_in_exp.sign_up_and_sign_in.or')} `}
                {verificationCode && (
                  <DiffSegment
                    hasChanged={hasAuthenticationChanged(identifierKey, 'verificationCode')}
                    isAfter={isAfter}
                  >
                    {needDisjunction
                      ? t(
                          'sign_in_exp.sign_up_and_sign_in.sign_in.verification_code_auth'
                        ).toLocaleLowerCase()
                      : t('sign_in_exp.sign_up_and_sign_in.sign_in.verification_code_auth')}
                  </DiffSegment>
                )}
                {hasAuthentication && ')'}
              </DiffSegment>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default SignInDiffSection;
