import classNames from 'classnames';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Checkbox from '@/components/Checkbox';
import TermsLinks from '@/components/TermsLinks';
import useTerms from '@/hooks/use-terms';
import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
};

const TermsOfUse = ({ className }: Props) => {
  const { termsAgreement, setTermsAgreement, termsOfUseUrl, privacyPolicyUrl, isTermsDisabled } =
    useTerms();
  const { t } = useTranslation();

  const prefix = t('description.agree_with_terms');

  const toggle = useCallback(() => {
    setTermsAgreement((termsAgreement) => !termsAgreement);
  }, [setTermsAgreement]);

  if (isTermsDisabled) {
    return null;
  }

  return (
    <div
      role="radio"
      aria-checked={termsAgreement}
      tabIndex={0}
      className={classNames(styles.terms, className)}
      onClick={toggle}
      onKeyDown={onKeyDownHandler({
        Escape: () => {
          setTermsAgreement(false);
        },
        Enter: toggle,
        ' ': toggle,
      })}
    >
      <Checkbox name="termsAgreement" checked={termsAgreement} className={styles.checkbox} />
      <div className={styles.content}>
        <span>{prefix}</span>
        <TermsLinks inline termsOfUseUrl={termsOfUseUrl} privacyPolicyUrl={privacyPolicyUrl} />
      </div>
    </div>
  );
};

export default TermsOfUse;
