import { conditional } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';

import DiffSegment from './DiffSegment';
import * as styles from './index.module.scss';
import type { SignInMethodsDiff } from './types';
import { createDiffFilter } from './utilities';

type Props = {
  signInMethodsDiff: SignInMethodsDiff;
  isAfter?: boolean;
};

const SignInDiffSection = ({ signInMethodsDiff, isAfter = false }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const diffFilter = createDiffFilter(isAfter);

  const displayMethods = signInMethodsDiff.filter(({ mutation }) => diffFilter(mutation));

  const renderSignInMethod = (method: SignInMethodsDiff[number]) => {
    const { mutation, identifier, password, verificationCode } = method;

    const passwordDiffs = password.filter(({ mutation }) => diffFilter(mutation));
    const verificationCodeDiffs = verificationCode.filter(({ mutation }) => diffFilter(mutation));

    const passwordElements = passwordDiffs
      .filter(({ value }) => value)
      .map(({ mutation }, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <DiffSegment key={index} mutation={mutation}>
          {t('sign_in_exp.sign_up_and_sign_in.sign_in.password_auth')}
        </DiffSegment>
      ));

    const verificationCodeElements = verificationCodeDiffs
      .filter(({ value }) => value)
      .map(({ mutation }, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <DiffSegment key={index} mutation={mutation}>
          {t('sign_in_exp.sign_up_and_sign_in.sign_in.verification_code_auth')}
        </DiffSegment>
      ));

    const hasAuthentication = passwordElements.length > 0 || verificationCodeElements.length > 0;
    const needDisjunction = passwordElements.length > 0 && verificationCodeElements.length > 0;
    const diffElements = [
      t('sign_in_exp.sign_up_and_sign_in.identifiers', { context: identifier }),
      conditional(hasAuthentication && ' ('),
      ...passwordElements,
      ...(conditional(needDisjunction && [' ', t('sign_in_exp.sign_up_and_sign_in.or'), ' ']) ??
        []),
      ...verificationCodeElements,
      conditional(hasAuthentication && ')'),
    ].filter(Boolean);

    return <DiffSegment mutation={mutation}>{diffElements}</DiffSegment>;
  };

  return (
    <div>
      <div className={styles.title}>SignIn</div>
      <ul className={styles.list}>
        {displayMethods.map((method) => (
          <li key={method.identifier}>{renderSignInMethod(method)}</li>
        ))}
      </ul>
    </div>
  );
};

export default SignInDiffSection;
