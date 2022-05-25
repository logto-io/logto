import classNames from 'classnames';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import congrats from '@/assets/images/congrats.svg';
import tada from '@/assets/images/tada.svg';
import Button from '@/components/Button';
import Card from '@/components/Card';
import RadioGroup, { Radio } from '@/components/RadioGroup';
import { SupportedSdk } from '@/types/applications';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  sdks: readonly SupportedSdk[];
  selectedSdk: SupportedSdk;
  onChange?: (value: string) => void;
  onToggle?: () => void;
};

const SdkSelector = ({ className, sdks, selectedSdk, onChange, onToggle }: Props) => {
  const [isFolded, setIsFolded] = useState(false);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  if (isFolded) {
    return (
      <div className={classNames(styles.card, styles.folded, className)}>
        <img src={tada} alt="Tada!" />
        <span>{t('applications.guide.description_by_sdk', { sdk: selectedSdk })}</span>
      </div>
    );
  }

  return (
    <Card className={classNames(styles.card, className)}>
      <img src={congrats} alt="success" />
      <div>
        <div className={styles.title}>{t('applications.guide.title')}</div>
        <div className={styles.subtitle}>{t('applications.guide.subtitle')}</div>
      </div>
      <RadioGroup
        className={styles.radioGroup}
        name="selectedSdk"
        value={selectedSdk}
        type="card"
        onChange={onChange}
      >
        {sdks.length > 1 &&
          sdks.map((sdk) => (
            <Radio key={sdk} className={styles.radio} value={sdk}>
              {sdk}
            </Radio>
          ))}
      </RadioGroup>
      <div className={styles.buttonWrapper}>
        <Button
          type="primary"
          title="general.next"
          onClick={() => {
            setIsFolded(true);
            onToggle?.();
          }}
        />
      </div>
    </Card>
  );
};

export default SdkSelector;
