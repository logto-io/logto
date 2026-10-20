import classNames from 'classnames';
import { useCallback } from 'react';

import Checkbox from '@/components/Checkbox';
import TextLink from '@/components/TextLink';
import useTerms from '@/hooks/use-terms';
import { onKeyDownHandler } from '@/shared/utils/a11y';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
};

const TermsAndPrivacyCheckbox = ({ className }: Props) => {
  const { termsAgreement, setTermsAgreement, termsOfUseUrl, privacyPolicyUrl, isTermsDisabled } =
    useTerms();

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
      <Checkbox
        name="termsAgreement"
        checked={termsAgreement}
        className={styles.checkbox}
        size="small"
      />
      <div className={styles.content}>
        <span>I agree to the </span>
        {termsOfUseUrl && (
          <TextLink
            className={styles.link}
            href={termsOfUseUrl}
            type="secondary"
            target="_blank"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            Terms and Conditions
          </TextLink>
        )}
        {termsOfUseUrl && privacyPolicyUrl && ' and '}
        {privacyPolicyUrl && (
          <TextLink
            className={styles.link}
            href={privacyPolicyUrl}
            type="secondary"
            target="_blank"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            Privacy Policy
          </TextLink>
        )}
      </div>
    </div>
  );
};

export default TermsAndPrivacyCheckbox;
