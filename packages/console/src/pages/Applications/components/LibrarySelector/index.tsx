import classNames from 'classnames';
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import highFive from '@/assets/images/high-five.svg';
import tada from '@/assets/images/tada.svg';
import Button from '@/components/Button';
import Card from '@/components/Card';
import RadioGroup, { Radio } from '@/components/RadioGroup';
import { SupportedJavascriptLibraries } from '@/types/applications';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  libraryName?: SupportedJavascriptLibraries;
  onChange?: (value: string) => void;
  onToggle?: () => void;
};

const LibrarySelector = ({
  className,
  libraryName = SupportedJavascriptLibraries.React,
  onChange,
  onToggle,
}: Props) => {
  const [isFolded, setIsFolded] = useState(false);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const librarySelector = useMemo(
    () => (
      <Card className={classNames(styles.card, className)}>
        <img src={highFive} alt="success" />
        <div>
          <div className={styles.title}>{t('applications.get_started.title')}</div>
          <div className={styles.subtitle}>{t('applications.get_started.subtitle')}</div>
        </div>
        <RadioGroup
          className={styles.radioGroup}
          name="libraryName"
          value={libraryName}
          onChange={onChange}
        >
          {Object.values(SupportedJavascriptLibraries).map((library) => (
            <Radio key={library} className={styles.radio} title={library} value={library} />
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
    ),
    [className, libraryName, onChange, onToggle, t]
  );

  const librarySelectorFolded = useMemo(
    () => (
      <div className={classNames(styles.card, styles.folded, className)}>
        <img src={tada} alt="Tada!" />
        <span>
          {t('applications.get_started.description_by_library', { library: libraryName })}
        </span>
      </div>
    ),
    [className, libraryName, t]
  );

  return isFolded ? librarySelectorFolded : librarySelector;
};

export default LibrarySelector;
