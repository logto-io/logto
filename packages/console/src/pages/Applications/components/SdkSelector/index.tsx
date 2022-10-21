import { AppearanceMode } from '@logto/schemas';
import classNames from 'classnames';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CongratsDark from '@/assets/images/congrats-dark.svg';
import Congrats from '@/assets/images/congrats.svg';
import TadaDark from '@/assets/images/tada-dark.svg';
import Tada from '@/assets/images/tada.svg';
import Button from '@/components/Button';
import Card from '@/components/Card';
import RadioGroup, { Radio } from '@/components/RadioGroup';
import Select from '@/components/Select';
import Spacer from '@/components/Spacer';
import { useTheme } from '@/hooks/use-theme';
import type { SupportedSdk } from '@/types/applications';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  sdks: readonly SupportedSdk[];
  selectedSdk: SupportedSdk;
  isCompact?: boolean;
  onChange?: (value: string) => void;
  onToggle?: () => void;
};

const SdkSelector = ({
  className,
  sdks,
  selectedSdk,
  isCompact = false,
  onChange,
  onToggle,
}: Props) => {
  const [isFolded, setIsFolded] = useState(isCompact);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const theme = useTheme();
  const isLightMode = theme === AppearanceMode.LightMode;
  const CongratsIcon = isLightMode ? Congrats : CongratsDark;
  const TadaIcon = isLightMode ? Tada : TadaDark;

  if (isFolded) {
    return (
      <div className={classNames(styles.card, styles.folded, className)}>
        <TadaIcon className={styles.tada} />
        <span>{t('applications.guide.description_by_sdk', { sdk: selectedSdk })}</span>
        <Spacer />
        <Select
          className={styles.select}
          value={selectedSdk}
          size="medium"
          options={sdks.map((sdk) => ({ value: sdk, title: sdk }))}
          onChange={(value) => {
            onChange?.(value ?? selectedSdk);
          }}
        />
      </div>
    );
  }

  return (
    <Card className={classNames(styles.card, className)}>
      <CongratsIcon className={styles.congrats} />
      <div className={styles.congratsText}>
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
          type="outline"
          title="general.next"
          size="large"
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
