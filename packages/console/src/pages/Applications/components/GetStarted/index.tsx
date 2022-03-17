import classNames from 'classnames';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import highFive from '@/assets/images/high-five.svg';
import tada from '@/assets/images/tada.svg';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import IconButton from '@/components/IconButton';
import RadioGroup, { Radio } from '@/components/RadioGroup';
import Spacer from '@/components/Spacer';
import Close from '@/icons/Close';
import { SupportedJavascriptLibraries } from '@/types/applications';

import * as styles from './index.module.scss';

type Props = {
  appName: string;
  onClose: () => void;
};

const GetStarted = ({ appName, onClose }: Props) => {
  const [isLibrarySelectorFolded, setIsLibrarySelectorFolded] = useState(false);
  const [libraryName, setLibraryName] = useState<string>(SupportedJavascriptLibraries.Angular);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const onClickFetchSampleProject = () => {
    window.open(
      `https://github.com/logto-io/js/tree/master/packages/${libraryName.toLowerCase()}-sample`,
      '_blank'
    );
  };

  const librarySelector = useMemo(
    () => (
      <Card className={classNames(styles.card, styles.selector)}>
        <img src={highFive} alt="success" />
        <CardTitle
          title="applications.get_started.title"
          subtitle="applications.get_started.subtitle"
        />
        <RadioGroup
          name="libraryName"
          value={libraryName}
          onChange={(value) => {
            setLibraryName(value);
          }}
        >
          {Object.values(SupportedJavascriptLibraries).map((library) => (
            <Radio key={library} className={styles.radio} title={library} value={library} />
          ))}
        </RadioGroup>
        <div className={styles.buttonWrapper}>
          <Spacer />
          <Button
            type="primary"
            title="general.next"
            onClick={() => {
              setIsLibrarySelectorFolded(true);
            }}
          />
        </div>
      </Card>
    ),
    [libraryName]
  );

  const librarySelectorFolded = useMemo(
    () => (
      <div className={classNames(styles.card, styles.selector, styles.folded)}>
        <img src={tada} alt="Tada!" />
        <span>
          {t('applications.get_started.description_by_library', { library: libraryName })}
        </span>
      </div>
    ),
    [libraryName, t]
  );

  return (
    <div className={styles.quickStartGuide}>
      <div className={styles.header}>
        <IconButton size="large" onClick={onClose}>
          <Close />
        </IconButton>
        <div className={styles.titleWrapper}>
          <div className={styles.title}>{appName}</div>
          <div className={styles.subtitle}>{t('applications.get_started.header_description')}</div>
        </div>
        <Spacer />
        <Button type="plain" size="small" title="general.skip" onClick={onClose} />
        <Button
          type="outline"
          title="admin_console.applications.get_started.get_sample_file"
          onClick={onClickFetchSampleProject}
        />
      </div>
      <div className={styles.content}>
        {isLibrarySelectorFolded ? librarySelectorFolded : librarySelector}
        {/* TO-DO: Dynamically render steps from markdown files */}
        <Card className={styles.card}>
          <div className={styles.index}>1</div>
          <CardTitle
            title="applications.get_started.title_step_1"
            subtitle="applications.get_started.subtitle_step_1"
          />
        </Card>
        <Card className={styles.card}>
          <div className={styles.index}>2</div>
          <CardTitle
            title="applications.get_started.title_step_2"
            subtitle="applications.get_started.subtitle_step_2"
          />
        </Card>
        <Card className={styles.card}>
          <div className={styles.index}>3</div>
          <CardTitle
            title="applications.get_started.title_step_3"
            subtitle="applications.get_started.subtitle_step_3"
          />
        </Card>
        <Card className={styles.card}>
          <div className={styles.index}>4</div>
          <CardTitle
            title="applications.get_started.title_step_4"
            subtitle="applications.get_started.subtitle_step_4"
          />
        </Card>
        <Card className={styles.card}>
          <div className={styles.index}>5</div>
          <CardTitle
            title="applications.get_started.title_step_5"
            subtitle="applications.get_started.subtitle_step_5"
          />
        </Card>
      </div>
    </div>
  );
};

export default GetStarted;
