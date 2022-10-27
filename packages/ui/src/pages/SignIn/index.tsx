import { BrandingStyle } from '@logto/schemas';
import classNames from 'classnames';
import { useContext } from 'react';

import BrandingHeader from '@/components/BrandingHeader';
import AppNotification from '@/containers/AppNotification';
import { PageContext } from '@/hooks/use-page-context';
import { getLogoUrl } from '@/utils/logo';

import MainForm from './MainForm';
import * as styles from './index.module.scss';

const SignIn = () => {
  const { experienceSettings, theme, platform } = useContext(PageContext);

  if (!experienceSettings) {
    return null;
  }

  const { slogan, logoUrl, darkLogoUrl, style } = experienceSettings.branding;

  return (
    <>
      {platform === 'web' && <div className={styles.placeholderTop} />}
      <div className={classNames(styles.wrapper)}>
        <BrandingHeader
          className={styles.header}
          headline={style === BrandingStyle.Logo_Slogan ? slogan : undefined}
          logo={getLogoUrl({ theme, logoUrl, darkLogoUrl })}
        />
        <MainForm />
        <AppNotification />
      </div>
      {platform === 'web' && <div className={styles.placeholderBottom} />}
    </>
  );
};

export default SignIn;
