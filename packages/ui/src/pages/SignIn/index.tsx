import { BrandingStyle, SignInMode } from '@logto/schemas';
import classNames from 'classnames';
import React, { useContext } from 'react';

import BrandingHeader from '@/components/BrandingHeader';
import AppNotification from '@/containers/AppNotification';
import { PageContext } from '@/hooks/use-page-context';

import * as styles from './index.module.scss';
import { PrimarySection, SecondarySection, CreateAccountLink } from './registry';

const SignIn = () => {
  const { experienceSettings, theme } = useContext(PageContext);

  if (!experienceSettings) {
    return null;
  }

  const { slogan, logoUrl, darkLogoUrl, style } = experienceSettings.branding;
  const logo = theme === 'light' ? logoUrl : darkLogoUrl ?? logoUrl;

  return (
    <div className={classNames(styles.wrapper)}>
      <BrandingHeader
        className={styles.header}
        headline={style === BrandingStyle.Logo_Slogan ? slogan : undefined}
        logo={logo}
      />
      <PrimarySection
        signInMethod={experienceSettings.primarySignInMethod}
        socialConnectors={experienceSettings.socialConnectors}
        signInMode={experienceSettings.signInMode}
      />
      <SecondarySection
        primarySignInMethod={experienceSettings.primarySignInMethod}
        secondarySignInMethods={experienceSettings.secondarySignInMethods}
        socialConnectors={experienceSettings.socialConnectors}
      />
      {experienceSettings.signInMode === SignInMode.SignInAndRegister && (
        <CreateAccountLink primarySignInMethod={experienceSettings.primarySignInMethod} />
      )}

      <AppNotification />
    </div>
  );
};

export default SignIn;
