import { BrandingStyle, SignInMode } from '@logto/schemas';
import classNames from 'classnames';
import { useContext, useLayoutEffect, useRef, useState } from 'react';

import BrandingHeader from '@/components/BrandingHeader';
import AppNotification from '@/containers/AppNotification';
import { PageContext } from '@/hooks/use-page-context';

import * as styles from './index.module.scss';
import { PrimarySection, SecondarySection, CreateAccountLink } from './registry';

const SignIn = () => {
  const { experienceSettings, theme, platform } = useContext(PageContext);
  const [topSpace, setTopSpace] = useState(0);

  const topPlaceHolderRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    setTimeout(() => {
      if (!topPlaceHolderRef.current) {
        return;
      }
      setTopSpace(topPlaceHolderRef.current.offsetHeight);
    });
  }, [topPlaceHolderRef]);

  if (!experienceSettings) {
    return null;
  }

  const { slogan, logoUrl, darkLogoUrl, style } = experienceSettings.branding;

  return (
    <>
      {platform === 'web' && (
        <div
          ref={topPlaceHolderRef}
          className={styles.placeholderTop}
          style={{ height: `${topSpace}px`, flex: `${topSpace === 0 ? 3 : 'none'}` }}
        />
      )}
      <div className={classNames(styles.wrapper)}>
        <BrandingHeader
          className={styles.header}
          headline={style === BrandingStyle.Logo_Slogan ? slogan : undefined}
          logo={(theme === 'dark' && darkLogoUrl) || logoUrl}
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
      {platform === 'web' && <div className={styles.placeholderBottom} />}
    </>
  );
};

export default SignIn;
