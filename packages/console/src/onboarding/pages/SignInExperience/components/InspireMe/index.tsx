import { ConnectorType } from '@logto/connector-kit';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Bulb from '@/assets/images/bulb.svg';
import LightBulb from '@/assets/images/light-bulb.svg';
import Button from '@/components/Button';
import useConnectorGroups from '@/hooks/use-connector-groups';
import type { OnboardingSieConfig } from '@/onboarding/types';

import { randomSieConfigTemplate } from '../../sie-config-templates';
import * as styles from './index.module.scss';

type Props = {
  onInspired: (template: OnboardingSieConfig) => void;
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
    const { template, templateIndex } = randomSieConfigTemplate(
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
