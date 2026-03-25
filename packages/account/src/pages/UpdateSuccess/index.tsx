import { SignInIdentifier, Theme } from '@logto/schemas';
import type { TFuncKey } from 'i18next';
import { useContext, useEffect, useMemo, useState } from 'react';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import successDarkIllustration from '@ac/assets/icons/success-dark.svg';
import successIllustration from '@ac/assets/icons/success.svg';
import ErrorPage from '@ac/components/ErrorPage';
import {
  clearPendingReturn,
  clearShowSuccess,
  getPendingReturn,
  getShowSuccess,
} from '@ac/utils/account-center-route';

type IdentifierType =
  | SignInIdentifier
  | 'password'
  | 'totp'
  | 'backup_code'
  | 'backup_code_deleted'
  | 'passkey'
  | 'social';

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
  passkey: {
    titleKey: 'account_center.update_success.passkey.title',
    messageKey: 'account_center.update_success.passkey.description',
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
  const { theme } = useContext(PageContext);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string>();

  const illustration = theme === Theme.Dark ? successDarkIllustration : successIllustration;

  const translationKeys = useMemo(() => {
    if (!identifierType) {
      return translationMap.default;
    }

    return translationMap[identifierType] ?? translationMap.default;
  }, [identifierType]);

  useEffect(() => {
    const storedPendingReturn = getPendingReturn();

    if (storedPendingReturn) {
      if (identifierType === 'social') {
        setRedirectUrl(() => storedPendingReturn);
        return;
      }

      const showSuccess = getShowSuccess();

      if (showSuccess) {
        setRedirectUrl(() => storedPendingReturn);
        return;
      }

      setIsRedirecting(true);
      clearPendingReturn();
      window.location.assign(storedPendingReturn);
    }
  }, [identifierType]);

  const handleDoneClick = () => {
    if (redirectUrl) {
      setIsRedirecting(true);
      clearPendingReturn();
      clearShowSuccess();
      window.location.assign(redirectUrl);
    }
  };

  // Show nothing while redirecting to avoid flash of success page
  if (isRedirecting) {
    return null;
  }

  return (
    <ErrorPage
      illustration={illustration}
      titleKey={translationKeys.titleKey}
      messageKey={translationKeys.messageKey}
      action={
        redirectUrl
          ? {
              titleKey: 'action.done',
              onClick: handleDoneClick,
            }
          : undefined
      }
    />
  );
};

export default UpdateSuccess;
