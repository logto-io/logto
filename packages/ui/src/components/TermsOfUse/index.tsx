import { TermsOfUse as TermsOfUseType } from '@logto/schemas';
import React from 'react';
import { useTranslation } from 'react-i18next';

import ErrorMessage, { ErrorType } from '@/components/ErrorMessage';
import { RadioButtonIcon } from '@/components/Icons';
import TextLink from '@/components/TextLink';

import * as styles from './index.module.scss';

type Props = {
  name: string;
  className?: string;
  termsOfUse: TermsOfUseType;
  isChecked?: boolean;
  error?: ErrorType;
  onChange: (checked: boolean) => void;
};

const TermsOfUse = ({ name, className, termsOfUse, isChecked, error, onChange }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });

  if (!termsOfUse.enabled || !termsOfUse.contentUrl) {
    return null;
  }

  const prefix = t('description.agree_with_terms');

  return (
    <div className={className}>
      <div
        className={styles.terms}
        onClick={() => {
          onChange(!isChecked);
        }}
      >
        <input disabled readOnly name={name} type="checkbox" checked={isChecked} />
        <RadioButtonIcon checked={isChecked} className={styles.radioButton} />
        <div className={styles.content}>
          {prefix}
          <TextLink
            text="description.terms_of_use"
            href={termsOfUse.contentUrl}
            type="secondary"
            onClick={(event) => {
              // Prevent above parent onClick event being triggered
              event.stopPropagation();
            }}
          />
        </div>
      </div>
      {error && <ErrorMessage error={error} className={styles.errorMessage} />}
    </div>
  );
};

export default TermsOfUse;
