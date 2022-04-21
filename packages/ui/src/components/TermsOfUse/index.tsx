import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { RadioButtonIcon } from '@/components/Icons';
import TextLink from '@/components/TextLink';

import * as styles from './index.module.scss';

type Props = {
  name: string;
  className?: string;
  termsUrl: string;
  isChecked?: boolean;
  onChange: (checked: boolean) => void;
};

const TermsOfUse = ({ name, className, termsUrl, isChecked, onChange }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });

  const prefix = t('description.agree_with_terms');

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
          className={styles.link}
          text="description.terms_of_use"
          href={termsUrl}
          target="_blank"
          type="secondary"
          onClick={(event) => {
            // Prevent above parent onClick event being triggered
            event.stopPropagation();
          }}
        />
      </div>
    </div>
  );
};

export default TermsOfUse;
