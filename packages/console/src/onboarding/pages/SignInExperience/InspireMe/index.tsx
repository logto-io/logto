import { ConnectorType } from '@logto/connector-kit';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Bulb from '@/assets/icons/bulb.svg?react';
import LightBulb from '@/assets/icons/light-bulb.svg?react';
import Button from '@/ds-components/Button';
import useConnectorGroups from '@/hooks/use-connector-groups';

import { randomSieFormDataTemplate } from '../sie-config-templates';
import { type OnboardingSieFormData } from '../types';

import styles from './index.module.scss';

type Props = {
  readonly onInspired: (template: OnboardingSieFormData) => void;
};

function InspireMe({ onInspired }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isButtonHover, setIsButtonHover] = useState(false);
  const BulbIcon = isButtonHover ? LightBulb : Bulb;
  const [lastTemplateIndex, setLastTemplateIndex] = useState<number>();
  const { data: connectorData, error } = useConnectorGroups();
  const availableSocialTargets = error
    ? []
    : connectorData
        ?.filter(({ type }) => type === ConnectorType.Social)
        .map(({ target }) => target) ?? [];

  const handleInspire = () => {
    const { template, templateIndex } = randomSieFormDataTemplate(
      lastTemplateIndex,
      availableSocialTargets
    );
    setLastTemplateIndex(templateIndex);
    onInspired(template);
  };

  return (
    <div className={styles.inspire}>
      <div className={styles.inspireContent}>
        <div className={styles.inspireTitle}>{t('cloud.sie.inspire.title')}</div>
        <div className={styles.inspireDescription}>{t('cloud.sie.inspire.description')}</div>
      </div>
      <Button
        icon={<BulbIcon />}
        size="large"
        className={styles.button}
        title="cloud.sie.inspire.inspire_me"
        onMouseEnter={() => {
          setIsButtonHover(true);
        }}
        onMouseLeave={() => {
          setIsButtonHover(false);
        }}
        onClick={handleInspire}
      />
    </div>
  );
}

export default InspireMe;
