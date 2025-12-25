import { SignInIdentifier } from '@logto/schemas';
import type { TFuncKey } from 'i18next';
import { useEffect, useMemo, useState } from 'react';

import successIllustration from '@ac/assets/icons/success.svg';
import ErrorPage from '@ac/components/ErrorPage';
import { clearRedirectUrl, getRedirectUrl } from '@ac/utils/account-center-route';

type IdentifierType =
  | SignInIdentifier
  | 'password'
  | 'totp'
  | 'backup_code'
  | 'backup_code_deleted'
  | 'passkey'
  | 'passkey_deleted';

type TranslationMap = Partial<
  Record<IdentifierType, { readonly titleKey: TFuncKey; readonly messageKey: TFuncKey }>
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
  backup_code_deleted: {
    titleKey: 'account_center.update_success.backup_code_deleted.title',
    messageKey: 'account_center.update_success.backup_code_deleted.description',
  },
  passkey: {
    titleKey: 'account_center.update_success.passkey.title',
    messageKey: 'account_center.update_success.passkey.description',
  },
  passkey_deleted: {
    titleKey: 'account_center.update_success.passkey_deleted.title',
    messageKey: 'account_center.update_success.passkey_deleted.description',
  },
  default: {
    titleKey: 'account_center.update_success.default.title',
    messageKey: 'account_center.update_success.default.description',
  },
};

type Props = {
  readonly identifierType?: IdentifierType;
};

const UpdateSuccess = ({ identifierType }: Props) => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const translationKeys = useMemo(() => {
    if (!identifierType) {
      return translationMap.default;
    }

    return translationMap[identifierType] ?? translationMap.default;
  }, [identifierType]);

  useEffect(() => {
    const redirectUrl = getRedirectUrl();

    if (redirectUrl) {
      setIsRedirecting(true);
      clearRedirectUrl();
      window.location.assign(redirectUrl);
    }
  }, []);

  // Show nothing while redirecting to avoid flash of success page
  if (isRedirecting) {
    return null;
  }

  return (
    <ErrorPage
      illustration={successIllustration}
      titleKey={translationKeys.titleKey}
      messageKey={translationKeys.messageKey}
    />
  );
};

export default UpdateSuccess;
