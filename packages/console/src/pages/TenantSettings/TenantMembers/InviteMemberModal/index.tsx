import { TenantRole } from '@logto/schemas';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import { useAuthedCloudApi } from '@/cloud/hooks/use-cloud-api';
import { TenantsContext } from '@/contexts/TenantsProvider';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import Select, { type Option } from '@/ds-components/Select';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import * as modalStyles from '@/scss/modal.module.scss';

import InviteEmailsInput from '../InviteEmailsInput';
import useEmailInputUtils from '../InviteEmailsInput/hooks';
import { type InviteMemberForm } from '../types';

import Footer from './Footer';

type Props = {
  isOpen: boolean;
  onClose: (isSuccessful?: boolean) => void;
};

function InviteMemberModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.tenant_members' });
  const { currentTenantId } = useContext(TenantsContext);

  const [isLoading, setIsLoading] = useState(false);
  const cloudApi = useAuthedCloudApi();
  const { parseEmailOptions } = useEmailInputUtils();
  const { show } = useConfirmModal();

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
      { value: TenantRole.Admin, title: t('admin') },
      { value: TenantRole.Collaborator, title: t('collaborator') },
    ],
    [t]
  );

  const onSubmit = handleSubmit(async ({ emails, role }) => {
    if (role === TenantRole.Admin) {
      const [result] = await show({
        ModalContent: () => (
          <Trans components={{ ul: <ul />, li: <li /> }}>{t('assign_admin_confirm')}</Trans>
        ),
        confirmButtonText: 'general.confirm',
      });

      if (!result) {
        return;
      }
    }

    setIsLoading(true);
    try {
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
        size="large"
        title="tenant_members.invite_modal.title"
        subtitle="tenant_members.invite_modal.subtitle"
        footer={
          <Footer
            newInvitationCount={watch('emails').length}
            isLoading={isLoading}
            onSubmit={onSubmit}
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
