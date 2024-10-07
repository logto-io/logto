import type { ScopeResponse, RoleType } from '@logto/schemas';
import { useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import RoleScopesTransfer from '@/components/RoleScopesTransfer';
import SkuName from '@/components/SkuName';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import useApi from '@/hooks/use-api';
import modalStyles from '@/scss/modal.module.scss';
import { hasSurpassedSubscriptionQuotaLimit } from '@/utils/quota';

type Props = {
  readonly roleId: string;
  readonly roleType: RoleType;
  readonly onClose: (success?: boolean) => void;
};

function AssignPermissionsModal({ roleId, roleType, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    currentSubscription: { planId, isEnterprisePlan },
    currentSubscriptionRoleScopeUsage,
    currentSubscriptionQuota,
  } = useContext(SubscriptionDataContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scopes, setScopes] = useState<ScopeResponse[]>([]);

  const api = useApi();

  const handleAssign = async () => {
    if (isSubmitting || scopes.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post(`api/roles/${roleId}/scopes`, {
        json: { scopeIds: scopes.map(({ id }) => id) },
      });
      toast.success(t('role_details.permission.permission_assigned'));
      onClose(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const shouldBlockScopeAssignment = hasSurpassedSubscriptionQuotaLimit({
    quotaKey: 'scopesPerRoleLimit',
    usage: (currentSubscriptionRoleScopeUsage[roleId] ?? 0) + scopes.length,
    quota: currentSubscriptionQuota,
  });

  return (
    <ReactModal
      isOpen
      shouldCloseOnEsc
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onClose();
      }}
    >
      <ModalLayout
        title="role_details.permission.assign_title"
        subtitle="role_details.permission.assign_subtitle"
        learnMoreLink={{
          href: 'https://docs.logto.io/docs/recipes/rbac/manage-permissions-and-roles#manage-role-permissions',
          targetBlank: 'noopener',
        }}
        size="large"
        footer={
          shouldBlockScopeAssignment ? (
            <QuotaGuardFooter>
              <Trans
                components={{
                  a: <ContactUsPhraseLink />,
                  planName: <SkuName skuId={planId} isEnterprisePlan={isEnterprisePlan} />,
                }}
              >
                {t('upsell.paywall.scopes_per_role', {
                  count: currentSubscriptionQuota.scopesPerRoleLimit ?? 0,
                })}
              </Trans>
            </QuotaGuardFooter>
          ) : (
            <Button
              isLoading={isSubmitting}
              disabled={scopes.length === 0}
              htmlType="submit"
              title="role_details.permission.confirm_assign"
              size="large"
              type="primary"
              onClick={handleAssign}
            />
          )
        }
        onClose={onClose}
      >
        <FormField title="role_details.permission.assign_form_field">
          <RoleScopesTransfer
            roleId={roleId}
            roleType={roleType}
            value={scopes}
            onChange={(scopes) => {
              setScopes(scopes);
            }}
          />
        </FormField>
      </ModalLayout>
    </ReactModal>
  );
}

export default AssignPermissionsModal;
