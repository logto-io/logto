import classNames from 'classnames';
import React from 'react';

import BrandingHeader from '@/components/BrandingHeader';
import TextLink from '@/components/TextLink';
import UsernameSignin from '@/containers/UsernameSignin';

import * as styles from './index.module.scss';

const SignIn = () => {
  return (
    <div className={classNames(styles.wrapper)}>
      {/* TODO: load content from sign-in experience  */}
      <BrandingHeader
        className={styles.header}
        headline="Welcome to Logto"
        logo="https://avatars.githubusercontent.com/u/84981374?s=400&u=6c44c3642f2fe15a59a56cdcb0358c0bd8b92f57&v=4"
      />
      <UsernameSignin />
      <TextLink className={styles.createAccount} href="/register" text="action.create_account" />
    </div>
  );
};

export default SignIn;
