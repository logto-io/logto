import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { signInWithEmail } from '@/apis/sign-in';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';

const useRegisterWithEmailErrorHandler = (email: string) => {
  const { t } = useTranslation();
  const { show } = useConfirmModal();
  const navigate = useNavigate();

  const { run: signInWithEmailAsync } = useApi(signInWithEmail);

  const emailExistRegisterHandler = useCallback(async () => {
    const [confirm] = await show({
      ModalContent: t('description.create_account_id_exists', {
        confirmText: 'action.sign_in',
        type: t(`description.email`),
        value: email,
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
  }, [navigate, show, signInWithEmailAsync, t, email]);

  const errorHandler = useMemo<ErrorHandlers>(
    () => ({
      'user.email_exists_register': async () => {
        await emailExistRegisterHandler();
      },
    }),
    [emailExistRegisterHandler]
  );

  return {
    errorHandler,
  };
};

export default useRegisterWithEmailErrorHandler;
