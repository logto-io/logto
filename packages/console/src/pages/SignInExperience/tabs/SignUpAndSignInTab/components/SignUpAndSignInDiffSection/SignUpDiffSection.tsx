import type { SignUp } from '@logto/schemas';
import { diff } from 'deep-object-diff';
import get from 'lodash.get';
import { useTranslation } from 'react-i18next';

import DiffSegment from './DiffSegment';
import * as styles from './index.module.scss';

type Props = {
  before: SignUp;
  after: SignUp;
  isAfter?: boolean;
};

const SignUpDiffSection = ({ before, after, isAfter = false }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const signUpDiff = isAfter ? diff(before, after) : diff(after, before);
  const signUp = isAfter ? after : before;
  const hasChanged = (path: keyof SignUp) => get(signUpDiff, path) !== undefined;

  const { identifier, password, verify } = signUp;
  const hasAuthentication = password || verify;
  const needConjunction = password && verify;

  return (
    <div>
      <div className={styles.title}>{t('sign_in_exp.save_alert.sign_up')}</div>
      <ul className={styles.list}>
        <li>
          <DiffSegment hasChanged={hasChanged('identifier')} isAfter={isAfter}>
            {t('sign_in_exp.sign_up_and_sign_in.identifiers', {
              context: identifier.toLowerCase(),
            })}
          </DiffSegment>
          {hasAuthentication && ' ('}
          {password && (
            <DiffSegment hasChanged={hasChanged('password')} isAfter={isAfter}>
              {t('sign_in_exp.sign_up_and_sign_in.sign_up.set_a_password_option')}
            </DiffSegment>
          )}
          {needConjunction && ` ${String(t('sign_in_exp.sign_up_and_sign_in.and'))} `}
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
};

export default SignUpDiffSection;
