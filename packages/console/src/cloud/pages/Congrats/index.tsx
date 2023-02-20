import classNames from 'classnames';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import AirPlay from '@/assets/images/air-play.svg';
import Calendar from '@/assets/images/calendar.svg';
import GetStarted from '@/assets/images/get-started.svg';
import ActionBar from '@/cloud/components/ActionBar';
import * as pageLayout from '@/cloud/scss/layout.module.scss';
import Button from '@/components/Button';
import Divider from '@/components/Divider';
import OverlayScrollbar from '@/components/OverlayScrollbar';
import { AppEndpointsContext } from '@/containers/AppEndpointsProvider';
import { buildUrl } from '@/utils/url';

import { CloudPage } from '../../types';
import { getCloudPagePathname } from '../../utils';
import * as styles from './index.module.scss';

const Congrats = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { userEndpoint } = useContext(AppEndpointsContext);

  const navigate = useNavigate();

  const enterAdminConsole = () => {
    navigate('/');
  };

  const handleBack = () => {
    navigate(getCloudPagePathname(CloudPage.SignInExperience));
  };

  return (
    <div className={pageLayout.page}>
      <OverlayScrollbar className={pageLayout.contentContainer}>
        <div className={classNames(pageLayout.content, styles.content)}>
          <GetStarted />
          <div className={styles.title}>{t('cloud.congrats.title')}</div>
          <div className={styles.description}>{t('cloud.congrats.description')}</div>
          <Button
            type="primary"
            size="large"
            title="cloud.congrats.check_out_button"
            icon={<AirPlay className={styles.buttonIcon} />}
            onClick={() => {
              window.open(new URL('/demo-app', userEndpoint), '_blank');
            }}
          />
          <Divider className={styles.divider} />
          <div className={styles.reservation}>
            <div className={styles.reservationInfo}>
              <Calendar className={styles.reservationIcon} />
              <div>
                <div className={styles.reservationTitle}>{t('cloud.congrats.reserve_title')}</div>
                <div className={styles.reservationDescription}>
                  {t('cloud.congrats.reserve_description')}
                </div>
              </div>
            </div>
            <Button
              type="outline"
              title="cloud.congrats.book_button"
              onClick={() => {
                const bookLink = buildUrl('https://calendly.com/logto/30min', {
                  // Note: month format is YYYY-MM
                  month: new Date().toISOString().slice(0, 7),
                });

                window.open(bookLink, '_blank');
              }}
            />
          </div>
        </div>
      </OverlayScrollbar>
      <ActionBar step={4}>
        <Button
          type="primary"
          title="cloud.congrats.enter_admin_console"
          onClick={enterAdminConsole}
        />
        <Button title="general.back" onClick={handleBack} />
      </ActionBar>
    </div>
  );
};

export default Congrats;
