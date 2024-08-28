import { type LogtoJwtTokenKeyType } from '@logto/schemas';
import { useCallback, useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { getPagePath } from '@/pages/CustomizeJwt/utils/path';

type Props = {
  readonly tokenType: LogtoJwtTokenKeyType;
};

function CreateButton({ tokenType }: Props) {
  const link = getPagePath(tokenType, 'create');
  const { navigate } = useTenantPathname();
  const { show } = useConfirmModal();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { currentPlan } = useContext(SubscriptionDataContext);
  const {
    quota: { customJwtEnabled },
  } = currentPlan;

  const onCreateButtonClick = useCallback(async () => {
    if (customJwtEnabled) {
      navigate(link);
      return;
    }

    const [confirm] = await show({
      title: 'upsell.paywall.custom_jwt.title',
      ModalContent: () => (
        <Trans
          components={{
            a: <ContactUsPhraseLink />,
          }}
        >
          {t('upsell.paywall.custom_jwt.description')}
        </Trans>
      ),
      confirmButtonText: 'upsell.upgrade_plan',
      confirmButtonType: 'primary',
      isCancelButtonVisible: false,
    });

    if (confirm) {
      // Navigate to subscription page by default
      navigate('/tenant-settings/subscription');
    }
  }, [customJwtEnabled, link, navigate, show, t]);

  return (
    <Button
      type="primary"
      title="jwt_claims.custom_jwt_create_button"
      onClick={onCreateButtonClick}
    />
  );
}

export default CreateButton;
