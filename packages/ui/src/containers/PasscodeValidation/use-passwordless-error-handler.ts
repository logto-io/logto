import { useCallback, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { registerWithEmail, registerWithSms } from '@/apis/register';
import { signInWithEmail, signInWithSms } from '@/apis/sign-in';
import useApi, { ErrorHandlers } from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { PageContext } from '@/hooks/use-page-context';
import { UserFlow, SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';
import { formatPhoneNumberWithCountryCallingCode } from '@/utils/country-code';

const usePasswordlessErrorHandler = (type: UserFlow, target: string) => {
  const { t } = useTranslation();
  const { show } = useConfirmModal();
  const navigate = useNavigate();
  const { setToast } = useContext(PageContext);

  const { run: registerWithSmsAsync } = useApi(registerWithSms);
  const { run: registerWithEmailAsync } = useApi(registerWithEmail);
  const { run: signInWithSmsAsync } = useApi(signInWithSms);
  const { run: signInWithEmailAsync } = useApi(signInWithEmail);

  const socialToBind = getSearchParameters(location.search, SearchParameters.bindWithSocial);

  const phoneNotExistSignInHandler = useCallback(async () => {
    const [confirm] = await show({
      ModalContent: t('description.sign_in_id_does_not_exists', {
        type: t(`description.phone_number`),
        value: formatPhoneNumberWithCountryCallingCode(target),
      }),
    });

    if (!confirm) {
      navigate(-1);

      return;
    }

    const result = await registerWithSmsAsync();

    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [navigate, registerWithSmsAsync, show, t, target]);

  const emailNotExistSignInHandler = useCallback(async () => {
    const [confirm] = await show({
      ModalContent: t('description.sign_in_id_does_not_exists', {
        type: t(`description.email`),
        value: target,
      }),
    });

    if (!confirm) {
      navigate(-1);

      return;
    }

    const result = await registerWithEmailAsync();

    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [navigate, registerWithEmailAsync, show, t, target]);

  const phoneExistRegisterHandler = useCallback(async () => {
    const [confirm] = await show({
      ModalContent: t('description.create_account_id_exists', {
        type: t(`description.phone_number`),
        value: formatPhoneNumberWithCountryCallingCode(target),
      }),
    });

    if (!confirm) {
      navigate(-1);

      return;
    }

    const result = await signInWithSmsAsync();

    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [navigate, show, signInWithSmsAsync, t, target]);

  const emailExistRegisterHandler = useCallback(async () => {
    const [confirm] = await show({
      ModalContent: t('description.create_account_id_exists', {
        type: t(`description.email`),
        value: target,
      }),
    });

    if (!confirm) {
      navigate(-1);

      return;
    }

    const result = await signInWithEmailAsync();

    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [navigate, show, signInWithEmailAsync, t, target]);

  const phoneNotExistForgotPasswordHandler = useCallback(async () => {
    await show({
      type: 'alert',
      ModalContent: t('description.forgot_password_id_does_not_exits', {
        type: t(`description.phone_number`),
        value: formatPhoneNumberWithCountryCallingCode(target),
      }),
      cancelText: 'action.got_it',
    });
    navigate(-1);
  }, [navigate, show, t, target]);

  const emailNotExistForgotPasswordHandler = useCallback(async () => {
    await show({
      type: 'alert',
      ModalContent: t('description.forgot_password_id_does_not_exits', {
        type: t(`description.email`),
        value: target,
      }),
      cancelText: 'action.got_it',
    });
    navigate(-1);
  }, [navigate, show, t, target]);

  const passwordlessErrorHandlers = useMemo<ErrorHandlers>(
    () => ({
      'user.phone_not_exists': async (error) => {
        if (type === 'forgot-password') {
          await phoneNotExistForgotPasswordHandler();

          return;
        }

        // Directly display the  error if user is trying to bind with social
        if (socialToBind) {
          setToast(error.message);
        }

        await phoneNotExistSignInHandler();
      },
      'user.email_not_exists': async (error) => {
        if (type === 'forgot-password') {
          await emailNotExistForgotPasswordHandler();

          return;
        }

        // Directly display the  error if user is trying to bind with social
        if (socialToBind) {
          setToast(error.message);
        }

        await emailNotExistSignInHandler();
      },
      'user.phone_exists_register': async () => {
        await phoneExistRegisterHandler();
      },
      'user.email_exists_register': async () => {
        await emailExistRegisterHandler();
      },
    }),
    [
      emailExistRegisterHandler,
      emailNotExistForgotPasswordHandler,
      emailNotExistSignInHandler,
      phoneExistRegisterHandler,
      phoneNotExistForgotPasswordHandler,
      phoneNotExistSignInHandler,
      setToast,
      socialToBind,
      type,
    ]
  );

  return {
    passwordlessErrorHandlers,
  };
};

export default usePasswordlessErrorHandler;
