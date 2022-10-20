import { useCallback, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { registerWithSms } from '@/apis/register';
import useApi, { ErrorHandlers } from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { PageContext } from '@/hooks/use-page-context';
import { SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';
import { formatPhoneNumberWithCountryCallingCode } from '@/utils/country-code';

const useSignInWithSmsErrorHandler = (phone: string) => {
  const { t } = useTranslation();
  const { show } = useConfirmModal();
  const navigate = useNavigate();
  const { setToast } = useContext(PageContext);

  const { run: registerWithSmsAsync } = useApi(registerWithSms);

  const socialToBind = getSearchParameters(location.search, SearchParameters.bindWithSocial);

  const phoneNotExistSignInHandler = useCallback(async () => {
    const [confirm] = await show({
      ModalContent: t('description.sign_in_id_does_not_exists', {
        confirmText: 'action.create',
        type: t(`description.phone_number`),
        value: formatPhoneNumberWithCountryCallingCode(phone),
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
  }, [navigate, registerWithSmsAsync, show, t, phone]);

  const errorHandler = useMemo<ErrorHandlers>(
    () => ({
      'user.phone_not_exists': async (error) => {
        // Directly display the  error if user is trying to bind with social
        if (socialToBind) {
          setToast(error.message);
        }

        await phoneNotExistSignInHandler();
      },
    }),
    [phoneNotExistSignInHandler, setToast, socialToBind]
  );

  return {
    errorHandler,
  };
};

export default useSignInWithSmsErrorHandler;
