import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import SocialLandingContainer from '@/containers/SocialLanding';
import useSocialLandingHandler from '@/hooks/use-social-landing-handler';

import * as styles from './index.module.scss';

type Parameters = {
  connector: string;
};

const SocialLanding = () => {
  const { connector: connectorId } = useParams<Parameters>();
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });

  useSocialLandingHandler(connectorId);

  if (!connectorId) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <SocialLandingContainer
        className={styles.connectorContainer}
        connectorId={connectorId}
        message={t('description.redirecting')}
      />
    </div>
  );
};

export default SocialLanding;
