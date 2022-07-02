import { BrandingStyle, SignInMode } from '@logto/schemas';
import classNames from 'classnames';
import React, { useContext } from 'react';

import darkLogto from '@/assets/logo/logto-dark.svg';
import lightLogto from '@/assets/logo/logto-light.svg';
import BrandingHeader from '@/components/BrandingHeader';
import AppNotification from '@/containers/AppNotification';
import { PageContext } from '@/hooks/use-page-context';

import * as styles from './index.module.scss';
import { PrimarySection, SecondarySection, CreateAccountLink } from './registry';

const SignIn = () => {
  const { experienceSettings, theme, platform } = useContext(PageContext);

  if (!experienceSettings) {
    return null;
  }

  const { slogan, logoUrl, darkLogoUrl, style } = experienceSettings.branding;

  const getLogto = () => {
    if (theme === 'light') {
      return logoUrl || lightLogto;
    }

    return darkLogoUrl ? darkLogoUrl : logoUrl || darkLogto;
  };

  return (
    <>
      {platform === 'web' && <div className={styles.placeHolderTop} />}
      <div className={classNames(styles.wrapper)}>
        <BrandingHeader
          className={styles.header}
          headline={style === BrandingStyle.Logo_Slogan ? slogan : undefined}
          logo={getLogto()}
        />
        <PrimarySection
          signInMethod={experienceSettings.primarySignInMethod}
          socialConnectors={experienceSettings.socialConnectors}
          signInMode={experienceSettings.signInMode}
        />

        {experienceSettings.signInMode !== SignInMode.Register && (
          <SecondarySection
            primarySignInMethod={experienceSettings.primarySignInMethod}
            secondarySignInMethods={experienceSettings.secondarySignInMethods}
            socialConnectors={experienceSettings.socialConnectors}
          />
        )}

        {experienceSettings.signInMode === SignInMode.SignInAndRegister && (
          <CreateAccountLink primarySignInMethod={experienceSettings.primarySignInMethod} />
        )}

        <AppNotification />
      </div>
      {platform === 'web' && <div className={styles.placeHolderBottom} />}
    </>
  );
};

export default SignIn;
