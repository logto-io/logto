import classNames from 'classnames';
import React, { useMemo, ReactNode } from 'react';
import { TFuncKey, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import reactStringReplace from 'react-string-replace';

import TextLink from '@/components/TextLink';
import { LocalSignInMethod } from '@/types';

import * as styles from './index.module.scss';

type Props = {
  signInMethods: LocalSignInMethod[];
  type?: 'primary' | 'secondary';
  className?: string;
};

const SignInMethodsKeyMap: {
  [key in LocalSignInMethod]: TFuncKey<'translation', 'main_flow.input'>;
} = {
  username: 'username',
  email: 'email',
  sms: 'phone_number',
};

const SignInMethodsLink = ({ signInMethods, type = 'secondary', className }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });

  const signInMethodsLink = useMemo(
    () =>
      signInMethods.map((method) => (
        <TextLink
          key={method}
          className={styles.signInMethodLink}
          text={`input.${SignInMethodsKeyMap[method]}`}
          onClick={() => {
            navigate(`/sign-in/${method}`);
          }}
        />
      )),
    [navigate, signInMethods]
  );

  if (signInMethodsLink.length === 0) {
    return null;
  }

  if (type === 'primary') {
    return <div className={classNames(styles.methodsPrimary, className)}>{signInMethodsLink}</div>;
  }

  if (signInMethods.length > 1) {
    const rawText = t('secondary.sign_in_with_2', {
      methods: signInMethods,
    });

    const textLink: ReactNode = signInMethods.reduce<ReactNode>(
      (content, method, index) =>
        // @ts-expect-error: reactStringReplace type bug, using deprecated ReactNodeArray as its input type
        reactStringReplace(content, method, () => signInMethodsLink[index]),
      rawText
    );

    return <div className={className}>{textLink}</div>;
  }

  const rawText = t('secondary.sign_in_with', { method: signInMethods[0] });
  const textLink = reactStringReplace(rawText, signInMethods[0], () => signInMethodsLink[0]);

  return <div className={className}>{textLink}</div>;
};

export default SignInMethodsLink;
