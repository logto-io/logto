import { ReservedPlanId, TenantRole } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import { useAuthedCloudApi } from '@/cloud/hooks/use-cloud-api';
import AddOnNoticeFooter from '@/components/AddOnNoticeFooter';
import { addOnPricingExplanationLink } from '@/consts/external-links';
import { tenantMembersAddOnUnitPrice } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import Select, { type Option } from '@/ds-components/Select';
import TextLink from '@/ds-components/TextLink';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useUserPreferences from '@/hooks/use-user-preferences';
import modalStyles from '@/scss/modal.module.scss';
import { hasReachedSubscriptionQuotaLimit } from '@/utils/quota';
import { isPaidPlan } from '@/utils/subscription';

import InviteEmailsInput from '../InviteEmailsInput';
import useEmailInputUtils from '../InviteEmailsInput/hooks';
import styles from '../index.module.scss';
import { type InviteMemberForm } from '../types';

import Footer from './Footer';

type Props = {
  readonly isOpen: boolean;
  readonly onClose: (isSuccessful?: boolean) => void;
};

function InviteMemberModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { currentTenantId } = useContext(TenantsContext);

  const [isLoading, setIsLoading] = useState(false);
  const cloudApi = useAuthedCloudApi();
  const { parseEmailOptions } = useEmailInputUtils();
  const { show } = useConfirmModal();
  const {
    currentSubscription: { planId, isAddOnAvailable, isEnterprisePlan },
    currentSubscriptionQuota,
    currentSubscriptionUsage: { tenantMembersLimit },
    mutateSubscriptionQuotaAndUsages,
  } = useContext(SubscriptionDataContext);
  const {
    data: { tenantMembersUpsellNoticeAcknowledged },
    update,
  } = useUserPreferences();

  const formMethods = useForm<InviteMemberForm>({
    defaultValues: {
      emails: [],
      role: TenantRole.Collaborator,
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = formMethods;

  useEffect(() => {
    return () => {
      reset();
    };
  }, [isOpen, reset]);

  const roleOptions: Array<Option<TenantRole>> = useMemo(
    () => [
      { value: TenantRole.Admin, title: t('tenant_members.admin') },
      { value: TenantRole.Collaborator, title: t('tenant_members.collaborator') },
    ],
    [t]
  );

  const hasTenantMembersReachedLimit = hasReachedSubscriptionQuotaLimit({
    quotaKey: 'tenantMembersLimit',
    usage: tenantMembersLimit,
    quota: currentSubscriptionQuota,
  });

  const onSubmit = handleSubmit(async ({ emails, role }) => {
    if (role === TenantRole.Admin) {
      const [result] = await show({
        ModalContent: () => (
          <Trans components={{ ul: <ul className={styles.list} />, li: <li /> }}>
            {t('tenant_members.assign_admin_confirm')}
          </Trans>
        ),
        confirmButtonText: 'general.confirm',
      });

      if (!result) {
        return;
      }
    }

    setIsLoading(true);
    if (emails.length > 0) {
      try {
        await cloudApi.post('/api/tenants/:tenantId/invitations', {
          params: { tenantId: currentTenantId },
          body: { invitee: emails.map(({ value }) => value), roleName: role },
        });
        mutateSubscriptionQuotaAndUsages();
        toast.success(t('tenant_members.messages.invitation_sent'));
        onClose(true);
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <ReactModal
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onClose();
      }}
    >
      <ModalLayout
        size="large"
        title="tenant_members.invite_modal.title"
        paywall={conditional(planId !== ReservedPlanId.Pro && ReservedPlanId.Pro)}
        hasAddOnTag={isAddOnAvailable && hasTenantMembersReachedLimit}
        subtitle="tenant_members.invite_modal.subtitle"
        footer={
          conditional(
            isAddOnAvailable &&
              hasTenantMembersReachedLimit &&
              // Just in case the enterprise plan has reached the resource limit, we still need to show charge notice.
              isPaidPlan(planId, isEnterprisePlan) &&
              !tenantMembersUpsellNoticeAcknowledged && (
                <AddOnNoticeFooter
                  isLoading={isLoading}
                  buttonTitle="tenant_members.invite_members"
                  onClick={async () => {
                    void update({ tenantMembersUpsellNoticeAcknowledged: true });
                    await onSubmit();
                  }}
                >
                  <Trans
                    components={{
                      span: <span className={styles.strong} />,
                      a: <TextLink to={addOnPricingExplanationLink} />,
                    }}
                  >
                    {t('upsell.add_on.footer.tenant_members', {
                      price: tenantMembersAddOnUnitPrice,
                    })}
                  </Trans>
                </AddOnNoticeFooter>
              )
          ) ?? (
            <Footer
              newInvitationCount={watch('emails').length}
              isLoading={isLoading}
              onSubmit={onSubmit}
            />
          )
        }
        onClose={onClose}
      >
        <FormProvider {...formMethods}>
          <FormField isRequired title="tenant_members.invite_modal.to">
            <Controller
              name="emails"
              control={control}
              rules={{
                validate: (value): string | true => {
                  if (value.length === 0) {
                    return t('tenant_members.errors.email_required');
                  }
                  const { errorMessage } = parseEmailOptions(value);
                  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                  return errorMessage || true;
                },
              }}
              render={({ field: { onChange, value } }) => (
                <InviteEmailsInput
                  values={value}
                  error={errors.emails?.message}
                  placeholder={t('tenant_members.invite_modal.email_input_placeholder')}
                  parseEmailOptions={parseEmailOptions}
                  onChange={onChange}
                />
              )}
            />
          </FormField>
          <FormField title="tenant_members.roles">
            <Controller
              name="role"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select options={roleOptions} value={value} onChange={onChange} />
              )}
            />
          </FormField>
        </FormProvider>
      </ModalLayout>
    </ReactModal>
  );
}

export default InviteMemberModal;
