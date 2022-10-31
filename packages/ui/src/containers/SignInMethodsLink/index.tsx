import type { SignIn } from '@logto/schemas';
import { SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import type { TFuncKey } from 'react-i18next';
import { useTranslation } from 'react-i18next';
import reactStringReplace from 'react-string-replace';

import TextLink from '@/components/TextLink';

import * as styles from './index.module.scss';

type Props = {
  signInMethods: SignIn['methods'];
  // Allows social page to pass additional query params to the sign-in pages
  search?: string;
  className?: string;
  template?: TFuncKey<'translation', 'secondary'>;
};

const SignInMethodsKeyMap: {
  [key in SignInIdentifier]: TFuncKey<'translation', 'input'>;
} = {
  [SignInIdentifier.Username]: 'username',
  [SignInIdentifier.Email]: 'email',
  [SignInIdentifier.Sms]: 'phone_number',
};

const SignInMethodsLink = ({ signInMethods, template, search, className }: Props) => {
  const { t } = useTranslation();
  const identifiers = signInMethods.map(({ identifier }) => identifier);

  const signInMethodsLink = useMemo(
    () =>
      identifiers.map((identifier) => (
        <TextLink
          key={identifier}
          className={styles.signInMethodLink}
          text={`input.${SignInMethodsKeyMap[identifier]}`}
          to={{ pathname: `/sign-in/${identifier}`, search }}
        />
      )),
    [identifiers, search]
  );

  if (signInMethodsLink.length === 0) {
    return null;
  }

  // Without text template
  if (!template) {
    return <div className={classNames(styles.methodsLinkList, className)}>{signInMethodsLink}</div>;
  }

  // With text template
  const rawText = t(`secondary.${template}`, { methods: identifiers });
  const textWithLink: ReactNode = identifiers.reduce<ReactNode>(
    (content, identifier, index) =>
      // @ts-expect-error: reactStringReplace type bug, using deprecated ReactNodeArray as its input type
      reactStringReplace(content, identifier, () => signInMethodsLink[index]),
    rawText
  );

  return <div className={classNames(styles.textLink, className)}>{textWithLink}</div>;
};

export default SignInMethodsLink;
