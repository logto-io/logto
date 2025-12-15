import { SignInIdentifier } from '@logto/schemas';
import type { TFuncKey } from 'i18next';
import { useMemo } from 'react';

import successIllustration from '@ac/assets/icons/success.svg';
import ErrorPage from '@ac/components/ErrorPage';

type TranslationMap = Partial<
  Record<
    SignInIdentifier | 'password' | 'totp' | 'backup_code',
    { readonly titleKey: TFuncKey; readonly messageKey: TFuncKey }
  >
> & {
  readonly default: { readonly titleKey: TFuncKey; readonly messageKey: TFuncKey };
};

const translationMap: TranslationMap = {
  [SignInIdentifier.Email]: {
    titleKey: 'account_center.update_success.email.title',
    messageKey: 'account_center.update_success.email.description',
  },
  [SignInIdentifier.Phone]: {
    titleKey: 'account_center.update_success.phone.title',
    messageKey: 'account_center.update_success.phone.description',
  },
  [SignInIdentifier.Username]: {
    titleKey: 'account_center.update_success.username.title',
    messageKey: 'account_center.update_success.username.description',
  },
  password: {
    titleKey: 'account_center.update_success.password.title',
    messageKey: 'account_center.update_success.password.description',
  },
  totp: {
    titleKey: 'account_center.update_success.totp.title',
    messageKey: 'account_center.update_success.totp.description',
  },
  backup_code: {
    titleKey: 'account_center.update_success.backup_code.title',
    messageKey: 'account_center.update_success.backup_code.description',
  },
  default: {
    titleKey: 'account_center.update_success.default.title',
    messageKey: 'account_center.update_success.default.description',
  },
};

type Props = {
  readonly identifierType?: SignInIdentifier | 'password' | 'totp' | 'backup_code';
};

const UpdateSuccess = ({ identifierType }: Props) => {
  const translationKeys = useMemo(() => {
    if (!identifierType) {
      return translationMap.default;
    }

    return translationMap[identifierType] ?? translationMap.default;
  }, [identifierType]);

  return (
    <ErrorPage
      illustration={successIllustration}
      titleKey={translationKeys.titleKey}
      messageKey={translationKeys.messageKey}
    />
  );
};

export default UpdateSuccess;
