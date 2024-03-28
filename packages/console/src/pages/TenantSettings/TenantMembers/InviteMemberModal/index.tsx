import { ReservedPlanId, TenantRole } from '@logto/schemas';
import { useContext, useMemo, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import { useAuthedCloudApi } from '@/cloud/hooks/use-cloud-api';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import Select, { type Option } from '@/ds-components/Select';
import * as modalStyles from '@/scss/modal.module.scss';

import InviteEmailsInput from '../InviteEmailsInput';
import useEmailInputUtils from '../InviteEmailsInput/hooks';
import { type InviteMemberForm } from '../types';

type Props = {
  isOpen: boolean;
  onClose: (isSuccessful?: boolean) => void;
};

function InviteMemberModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.tenant_members' });
  const { currentPlan } = useContext(SubscriptionDataContext);
  const { currentTenantId, isDevTenant } = useContext(TenantsContext);
  const tenantMembersMaxLimit = useMemo(() => {
    if (currentPlan.id === ReservedPlanId.Pro || isDevTenant) {
      return 10;
    }
    // Free plan can only have 1 admin, no other members allowed.
    return 1;
  }, [currentPlan.id, isDevTenant]);

  const [isLoading, setIsLoading] = useState(false);
  const cloudApi = useAuthedCloudApi();
  const { parseEmailOptions } = useEmailInputUtils();

  const formMethods = useForm<InviteMemberForm>({
    defaultValues: {
      emails: [],
      role: TenantRole.Member,
    },
  });

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = formMethods;

  const roleOptions: Array<Option<TenantRole>> = useMemo(
    () => [
      { value: TenantRole.Admin, title: t('admin') },
      { value: TenantRole.Member, title: t('member') },
    ],
    [t]
  );

  const onSubmit = handleSubmit(async ({ emails, role }) => {
    setIsLoading(true);
    try {
      // Count the current tenant members
      const members = await cloudApi.get(`/api/tenants/:tenantId/members`, {
        params: { tenantId: currentTenantId },
      });
      // Check if it will exceed the tenant member limit
      if (emails.length + members.length > tenantMembersMaxLimit) {
        setError('emails', {
          type: 'custom',
          message: t('errors.max_member_limit', { limit: tenantMembersMaxLimit }),
        });
        return;
      }

      await Promise.all(
        emails.map(async (email) =>
          cloudApi.post('/api/tenants/:tenantId/invitations', {
            params: { tenantId: currentTenantId },
            body: { invitee: email.value, roleName: role },
          })
        )
      );
      toast.success(t('messages.invitation_sent'));
      onClose(true);
    } finally {
      setIsLoading(false);
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
        title="tenant_members.invite_modal.title"
        footer={
          <Button
            size="large"
            type="primary"
            title="tenant_members.invite_members"
            isLoading={isLoading}
            onClick={onSubmit}
          />
        }
        onClose={onClose}
      >
        <FormProvider {...formMethods}>
          <FormField isRequired title="tenant_members.invite_modal.to">
            <Controller
              name="emails"
              control={control}
              rules={{
                validate: (value) => {
                  if (value.length === 0) {
                    return t('errors.email_required');
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
                  placeholder={t('invite_modal.email_input_placeholder')}
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
