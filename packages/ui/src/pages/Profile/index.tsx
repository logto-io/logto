import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { getUserProfile } from '@/apis/profile';
import LoadingLayer from '@/components/LoadingLayer';
import NavBar from '@/components/NavBar';
import useApi from '@/hooks/use-api';
import usePlatform from '@/hooks/use-platform';

import DesktopView from './containers/DesktopView';
import MobileView from './containers/MobileView';
import * as styles from './index.module.scss';

const Profile = () => {
  const { t } = useTranslation();
  const { isMobile } = usePlatform();
  const { run: asyncGetProfile, result: profile } = useApi(getUserProfile);
  const ContainerView = isMobile ? MobileView : DesktopView;

  useEffect(() => {
    void asyncGetProfile();
  }, [asyncGetProfile]);

  if (!profile) {
    return <LoadingLayer />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          {isMobile && <NavBar type="close" title={t('profile.title')} />}
          {!isMobile && (
            <>
              <div className={styles.title}>{t('profile.title')}</div>
              <div className={styles.subtitle}>{t('profile.description')}</div>
            </>
          )}
        </div>
        <ContainerView profile={profile} />
      </div>
    </div>
  );
};

export default Profile;
