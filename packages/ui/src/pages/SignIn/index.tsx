import classNames from 'classnames';
import React, { useState } from 'react';

import { socialConnectors } from '@/__mocks__/logto';
import BrandingHeader from '@/components/BrandingHeader';
import TextLink from '@/components/TextLink';
import { SecondarySocialSignIn, SocialSignInPopUp } from '@/containers/SocialSignIn';

import * as styles from './index.module.scss';

const SignIn = () => {
  const [open, isOpen] = useState(false);

  return (
    <div className={classNames(styles.wrapper)}>
      {/* TODO: load content from sign-in experience  */}
      <BrandingHeader
        className={styles.header}
        headline="Welcome to Logto"
        logo="https://avatars.githubusercontent.com/u/84981374?s=400&u=6c44c3642f2fe15a59a56cdcb0358c0bd8b92f57&v=4"
      />
      <SecondarySocialSignIn
        connectors={socialConnectors}
        showMoreConnectors={() => {
          isOpen(true);
        }}
      />
      <TextLink className={styles.createAccount} href="/register" text="action.create_account" />
      <SocialSignInPopUp
        connectors={socialConnectors}
        isOpen={open}
        onClose={() => {
          isOpen(false);
        }}
      />
    </div>
  );
};

export default SignIn;
