import { type LogtoJwtTokenKeyType } from '@logto/schemas';
import { useCallback, useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import { isDevFeaturesEnabled } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { getPagePath } from '@/pages/CustomizeJwt/utils/path';

type Props = {
  readonly isDisabled: boolean;
  readonly tokenType: LogtoJwtTokenKeyType;
};

function CreateButton({ isDisabled, tokenType }: Props) {
  const link = getPagePath(tokenType, 'create');
  const { navigate } = useTenantPathname();
  const { show } = useConfirmModal();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { currentPlan, currentSubscriptionQuota } = useContext(SubscriptionDataContext);

  const isCustomJwtEnabled = isDevFeaturesEnabled
    ? currentSubscriptionQuota.customJwtEnabled
    : currentPlan.quota.customJwtEnabled;

  const onCreateButtonClick = useCallback(async () => {
    if (isCustomJwtEnabled) {
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
  }, [isCustomJwtEnabled, link, navigate, show, t]);

  return (
    <Button
      type="primary"
      title="jwt_claims.custom_jwt_create_button"
      disabled={isDevFeaturesEnabled && isDisabled}
      onClick={onCreateButtonClick}
    />
  );
}

export default CreateButton;
