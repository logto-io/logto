import { conditional } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';

import DiffSegment from './DiffSegment';
import * as styles from './index.module.scss';
import type { SignUpDiff } from './types';
import { createDiffFilter } from './utilities';

type Props = {
  signUpDiff: SignUpDiff;
  isAfter?: boolean;
};

const SignUpDiffSection = ({ signUpDiff, isAfter = false }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { identifier, password, verify } = signUpDiff;

  const diffFilter = createDiffFilter(isAfter);

  const identifierDiffs = identifier.filter(({ mutation }) => diffFilter(mutation));
  const passwordDiffs = password.filter(({ mutation }) => diffFilter(mutation));
  const verifyDiffs = verify.filter(({ mutation }) => diffFilter(mutation));

  const identifierElements = identifierDiffs.map(({ mutation, value }, index) => (
    // eslint-disable-next-line react/no-array-index-key
    <DiffSegment key={index} mutation={mutation}>
      {t('sign_in_exp.sign_up_and_sign_in.identifiers', { context: value.toLowerCase() })}
    </DiffSegment>
  ));

  const passwordElements = passwordDiffs
    .filter(({ value }) => value)
    .map(({ mutation }, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <DiffSegment key={index} mutation={mutation}>
        {t('sign_in_exp.sign_up_and_sign_in.sign_up.set_a_password_option')}
      </DiffSegment>
    ));

  const verifyElements = verifyDiffs
    .filter(({ value }) => value)
    .map(({ mutation }, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <DiffSegment key={index} mutation={mutation}>
        {t('sign_in_exp.sign_up_and_sign_in.sign_up.verify_at_sign_up_option')}
      </DiffSegment>
    ));

  const hasAuthentication = passwordElements.length > 0 || verifyElements.length > 0;
  const needConjunction = passwordElements.length > 0 && verifyElements.length > 0;
  const diffElements = [
    ...identifierElements,
    conditional(hasAuthentication && ' ('),
    ...passwordElements,
    ...(conditional(needConjunction && [' ', t('sign_in_exp.sign_up_and_sign_in.and'), ' ']) ?? []),
    ...verifyElements,
    conditional(hasAuthentication && ')'),
  ].filter(Boolean);

  return (
    <div>
      <div className={styles.title}>SignUp</div>
      <ul className={styles.list}>
        <li>{diffElements}</li>
      </ul>
    </div>
  );
};

export default SignUpDiffSection;
