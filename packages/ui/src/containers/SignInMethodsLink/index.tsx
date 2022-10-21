import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import type { TFuncKey } from 'react-i18next';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import reactStringReplace from 'react-string-replace';

import TextLink from '@/components/TextLink';
import type { LocalSignInMethod } from '@/types';

import * as styles from './index.module.scss';

type Props = {
  signInMethods: LocalSignInMethod[];
  search?: string;
  className?: string;
  template?: TFuncKey<'translation', 'secondary'>;
};

const SignInMethodsKeyMap: {
  [key in LocalSignInMethod]: TFuncKey<'translation', 'input'>;
} = {
  username: 'username',
  email: 'email',
  sms: 'phone_number',
};

const SignInMethodsLink = ({ signInMethods, template, search, className }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const signInMethodsLink = useMemo(
    () =>
      signInMethods.map((method) => (
        <TextLink
          key={method}
          className={styles.signInMethodLink}
          text={`input.${SignInMethodsKeyMap[method]}`}
          onClick={() => {
            navigate({
              pathname: `/sign-in/${method}`,
              search,
            });
          }}
        />
      )),
    [navigate, search, signInMethods]
  );

  if (signInMethodsLink.length === 0) {
    return null;
  }

  // Without text template
  if (!template) {
    return <div className={classNames(styles.methodsLinkList, className)}>{signInMethodsLink}</div>;
  }

  // With text template
  const rawText = t(`secondary.${template}`, { methods: signInMethods });
  const textWithLink: ReactNode = signInMethods.reduce<ReactNode>(
    (content, method, index) =>
      // @ts-expect-error: reactStringReplace type bug, using deprecated ReactNodeArray as its input type
      reactStringReplace(content, method, () => signInMethodsLink[index]),
    rawText
  );

  return <div className={classNames(styles.textLink, className)}>{textWithLink}</div>;
};

export default SignInMethodsLink;
