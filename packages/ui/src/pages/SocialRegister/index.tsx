import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import NavBar from '@/components/NavBar';
import SocialCreateAccount from '@/containers/SocialCreateAccount';
import usePlatform from '@/hooks/use-platform';

import * as styles from './index.module.scss';

type Parameters = {
  connector: string;
};

const SocialRegister = () => {
  const { t } = useTranslation();
  const { connector } = useParams<Parameters>();
  const { isMobile } = usePlatform();

  if (!connector) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <NavBar title={isMobile ? t('description.bind_account_title') : undefined} />
      <div className={styles.container}>
        {!isMobile && <div className={styles.title}>{t('description.bind_account_title')}</div>}
        <SocialCreateAccount connectorId={connector} />
      </div>
    </div>
  );
};

export default SocialRegister;
