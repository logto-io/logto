import { BrandingStyle } from '@logto/schemas';
import classNames from 'classnames';
import React, { useContext } from 'react';

import BrandingHeader from '@/components/BrandingHeader';
import TextLink from '@/components/TextLink';
import UsernameSignin from '@/containers/UsernameSignin';
import { PageContext } from '@/hooks/use-page-context';

import * as styles from './index.module.scss';

const SignIn = () => {
  const { experienceSettings } = useContext(PageContext);
  const { slogan, logoUrl = '', style } = experienceSettings?.branding ?? {};

  return (
    <div className={classNames(styles.wrapper)}>
      {/* TODO: load content from sign-in experience  */}
      <BrandingHeader
        className={styles.header}
        headline={style === BrandingStyle.Logo_Slogan ? slogan : undefined}
        logo={logoUrl}
      />
      <UsernameSignin />
      <TextLink
        className={styles.createAccount}
        type="secondary"
        href="/register"
        text="action.create_account"
      />
    </div>
  );
};

export default SignIn;
