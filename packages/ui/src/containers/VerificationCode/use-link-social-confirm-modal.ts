import { SignInIdentifier } from '@logto/schemas';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useLinkSocial from '@/hooks/use-social-link-account';
import type { VerificationCodeIdentifier } from '@/types';
import { formatPhoneNumberWithCountryCallingCode } from '@/utils/country-code';

const useLinkSocialConfirmModal = () => {
  const { show } = useConfirmModal();
  const { t } = useTranslation();
  const linkWithSocial = useLinkSocial();
  const navigate = useNavigate();

  return useCallback(
    async (method: VerificationCodeIdentifier, target: string, connectorId: string) => {
      const [confirm] = await show({
        confirmText: 'action.bind_and_continue',
        cancelText: 'action.change',
        cancelTextI18nProps: {
          method: t(`description.${method === SignInIdentifier.Email ? 'email' : 'phone_number'}`),
        },
        ModalContent: t('description.link_account_id_exists', {
          type: t(`description.${method === SignInIdentifier.Email ? 'email' : 'phone_number'}`),
          value:
            method === SignInIdentifier.Phone
              ? formatPhoneNumberWithCountryCallingCode(target)
              : target,
        }),
      });

      if (!confirm) {
        navigate(-1);

        return;
      }

      await linkWithSocial(connectorId);
    },
    [linkWithSocial, navigate, show, t]
  );
};

export default useLinkSocialConfirmModal;
