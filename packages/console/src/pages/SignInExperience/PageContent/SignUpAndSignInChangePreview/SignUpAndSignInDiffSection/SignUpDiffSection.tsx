import { AlternativeSignUpIdentifier, type SignUp } from '@logto/schemas';
import { getSafe } from '@silverhand/essentials';
import { diff } from 'deep-object-diff';
import { useTranslation } from 'react-i18next';

import DynamicT from '@/ds-components/DynamicT';

import type { SignUpForm } from '../../../types';
import { signUpIdentifierPhrase } from '../../constants';
import { signUpFormDataParser } from '../../utils/parser';

import DiffSegment from './DiffSegment';
import styles from './index.module.scss';

type Props = {
  readonly before: SignUp;
  readonly after: SignUp;
  readonly isAfter?: boolean;
};

/**
 * @deprecated
 * TODO: replace with NewSignUpDiffSection after dev features are ready
 */
function SignUpDiffSection({ before, after, isAfter = false }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const parsedBefore = signUpFormDataParser.fromSignUp(before);
  const parsedAfter = signUpFormDataParser.fromSignUp(after);
  const signUpDiff = isAfter ? diff(parsedBefore, parsedAfter) : diff(parsedAfter, parsedBefore);
  const signUp = isAfter ? parsedAfter : parsedBefore;
  const hasChanged = (path: keyof SignUpForm) => getSafe(signUpDiff, path) !== undefined;

  const { identifier, password, verify } = signUp;
  const hasAuthentication = password || verify;
  const needConjunction = password && verify;

  return (
    <div>
      <div className={styles.title}>{t('sign_in_exp.save_alert.sign_up')}</div>
      <ul className={styles.list}>
        <li>
          <DiffSegment hasChanged={hasChanged('identifier')} isAfter={isAfter}>
            <DynamicT forKey={signUpIdentifierPhrase[identifier]} />
          </DiffSegment>
          {hasAuthentication && ' ('}
          {password && (
            <DiffSegment hasChanged={hasChanged('password')} isAfter={isAfter}>
              {t('sign_in_exp.sign_up_and_sign_in.sign_up.set_a_password_option')}
            </DiffSegment>
          )}
          {needConjunction && ` ${t('sign_in_exp.sign_up_and_sign_in.and')} `}
          {verify && (
            <DiffSegment hasChanged={hasChanged('verify')} isAfter={isAfter}>
              {needConjunction
                ? t(
                    'sign_in_exp.sign_up_and_sign_in.sign_up.verify_at_sign_up_option'
                  ).toLowerCase()
                : t('sign_in_exp.sign_up_and_sign_in.sign_up.verify_at_sign_up_option')}
            </DiffSegment>
          )}
          {hasAuthentication && ')'}
        </li>
      </ul>
    </div>
  );
}

export function NewSignUpDiffSection({ before, after, isAfter = false }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const parsedBefore = signUpFormDataParser.fromSignUp(before);
  const parsedAfter = signUpFormDataParser.fromSignUp(after);
  const signUpDiff = isAfter ? diff(parsedBefore, parsedAfter) : diff(parsedAfter, parsedBefore);
  const signUp = isAfter ? parsedAfter : parsedBefore;
  const hasChanged = (keySerial: string) => getSafe(signUpDiff, keySerial) !== undefined;

  const { identifiers, password, verify } = signUp;

  return (
    <div>
      <div className={styles.title}>{t('sign_in_exp.save_alert.sign_up')}</div>
      <ul className={styles.list}>
        {identifiers.map(({ identifier }, index) => (
          <li key={identifier}>
            <DiffSegment hasChanged={hasChanged(`identifiers.${index}`)} isAfter={isAfter}>
              {identifier === AlternativeSignUpIdentifier.EmailOrPhone
                ? t('sign_in_exp.sign_up_and_sign_in.identifiers_email_or_sms')
                : t(`sign_in_exp.sign_up_and_sign_in.identifiers_${identifier}`)}
            </DiffSegment>
          </li>
        ))}
        {password && (
          <li>
            <DiffSegment hasChanged={hasChanged('password')} isAfter={isAfter}>
              {t('sign_in_exp.sign_up_and_sign_in.sign_up.set_a_password_option')}
            </DiffSegment>
          </li>
        )}
        {verify && (
          <li>
            <DiffSegment hasChanged={hasChanged('verify')} isAfter={isAfter}>
              {t('sign_in_exp.sign_up_and_sign_in.sign_up.verify_at_sign_up_option')}
            </DiffSegment>
          </li>
        )}
      </ul>
    </div>
  );
}

export default SignUpDiffSection;
