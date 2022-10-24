import { useCallback, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { registerWithEmail } from '@/apis/register';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { PageContext } from '@/hooks/use-page-context';
import { SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';

const useSignInWithEmailErrorHandler = (email: string) => {
  const { t } = useTranslation();
  const { show } = useConfirmModal();
  const navigate = useNavigate();
  const { setToast } = useContext(PageContext);

  const { run: registerWithEmailAsync } = useApi(registerWithEmail);

  const socialToBind = getSearchParameters(location.search, SearchParameters.bindWithSocial);

  const emailNotExistSignInHandler = useCallback(async () => {
    const [confirm] = await show({
      confirmText: 'action.create',
      ModalContent: t('description.sign_in_id_does_not_exists', {
        type: t(`description.email`),
        value: email,
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
  }, [navigate, registerWithEmailAsync, show, t, email]);

  const errorHandler = useMemo<ErrorHandlers>(
    () => ({
      'user.email_not_exists': async (error) => {
        // Directly display the  error if user is trying to bind with social
        if (socialToBind) {
          setToast(error.message);
        }

        await emailNotExistSignInHandler();
      },
    }),
    [emailNotExistSignInHandler, setToast, socialToBind]
  );

  return {
    errorHandler,
  };
};

export default useSignInWithEmailErrorHandler;
