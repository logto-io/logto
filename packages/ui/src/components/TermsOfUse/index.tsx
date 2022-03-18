import { TermsOfUse as TermsOfUseType } from '@logto/schemas';
import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import RadioButtonIcon from '@/components/Icons/RadioButtonIcon';
import TextLink from '@/components/TextLink';

import * as styles from './index.module.scss';

type Props = {
  name: string;
  className?: string;
  termsOfUse: TermsOfUseType;
  isChecked?: boolean;
  onChange: (checked: boolean) => void;
};

const TermsOfUse = ({ name, className, termsOfUse, isChecked, onChange }: Props) => {
  const { t } = useTranslation();

  if (!termsOfUse.enabled || !termsOfUse.contentUrl) {
    return null;
  }

  const prefix = t('sign_in.terms_agreement_prefix');

  return (
    <div
      className={classNames(styles.terms, className)}
      onClick={() => {
        onChange(!isChecked);
      }}
    >
      <input disabled readOnly name={name} type="checkbox" checked={isChecked} />
      <RadioButtonIcon checked={isChecked} className={styles.radioButton} />
      <div className={styles.content}>
        {prefix}
        <TextLink
          text="sign_in.terms_of_use"
          href={termsOfUse.contentUrl}
          type="secondary"
          onClick={(event) => {
            event.stopPropagation();
          }}
        />
      </div>
    </div>
  );
};

export default TermsOfUse;
