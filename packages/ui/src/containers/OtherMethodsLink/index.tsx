import { SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import type { TFuncKey } from 'react-i18next';
import { useTranslation } from 'react-i18next';
import reactStringReplace from 'react-string-replace';

import TextLink from '@/components/TextLink';
import type { UserFlow } from '@/types';

import * as styles from './index.module.scss';

type Props = {
  methods: SignInIdentifier[];
  flow: Exclude<UserFlow, 'forgot-password'>;
  // Allows social page to pass additional query params to the sign-in pages
  search?: string;
  className?: string;
  template: TFuncKey<'translation', 'secondary'>;
};

const SignInMethodsKeyMap: {
  [key in SignInIdentifier]: TFuncKey<'translation', 'input'>;
} = {
  [SignInIdentifier.Username]: 'username',
  [SignInIdentifier.Email]: 'email',
  [SignInIdentifier.Sms]: 'phone_number',
};

const OtherMethodsLink = ({ methods, template, search, flow, className }: Props) => {
  const { t } = useTranslation();

  const methodsLink = useMemo(
    () =>
      methods.map((identifier) => (
        <TextLink
          key={identifier}
          className={styles.signInMethodLink}
          text={`input.${SignInMethodsKeyMap[identifier]}`}
          to={{ pathname: `/${flow}/${identifier}`, search }}
        />
      )),
    [flow, methods, search]
  );

  if (methodsLink.length === 0) {
    return null;
  }

  // Raw i18n text
  const rawText = t(`secondary.${template}`, { methods });

  // Replace with link element
  const textWithLink: ReactNode = methods.reduce<ReactNode>(
    (content, identifier, index) =>
      // @ts-expect-error: reactStringReplace type bug, using deprecated ReactNodeArray as its input type
      reactStringReplace(content, identifier, () => methodsLink[index]),
    rawText
  );

  return <div className={classNames(styles.textLink, className)}>{textWithLink}</div>;
};

export default OtherMethodsLink;
