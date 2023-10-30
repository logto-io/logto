import { type OrganizationScope } from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import TextInput from '@/ds-components/TextInput';
import useActionTranslation from '@/hooks/use-action-translation';
import useApi from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

export const organizationScopesPath = 'api/organization-scopes';

type Props = {
  isOpen: boolean;
  editData: Nullable<OrganizationScope>;
  onClose: () => void;
};

/** A modal that allows users to create or edit an organization scope. */
function PermissionModal({ isOpen, editData, onClose }: Props) {
  const api = useApi();
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Partial<OrganizationScope>>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const tAction = useActionTranslation();
  const title = editData
    ? tAction('edit', 'organizations.organization_permission')
    : tAction('create', 'organizations.organization_permission');
  const action = editData ? t('general.save') : tAction('create', 'organizations.permission');

  const submit = handleSubmit(
    trySubmitSafe(async (json) => {
      await (editData
        ? api.patch(`${organizationScopesPath}/${editData.id}`, {
            json,
          })
        : api.post(organizationScopesPath, {
            json,
          }));
      onClose();
    })
  );

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      reset(editData ?? {});
    }
  }, [editData, isOpen, reset]);

  return (
    <ReactModal
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onClose}
    >
      <ModalLayout
        title={<DangerousRaw>{title}</DangerousRaw>}
        footer={
          <Button
            type="primary"
            title={<DangerousRaw>{action}</DangerousRaw>}
            isLoading={isSubmitting}
            onClick={submit}
          />
        }
        onClose={onClose}
      >
        <form>
          <FormField isRequired title="general.name">
            <TextInput
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              placeholder="read:appointment"
              error={Boolean(errors.name)}
              disabled={Boolean(editData)}
              {...register('name', { required: true })}
            />
          </FormField>
          <FormField title="general.description">
            <TextInput
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus={Boolean(editData)}
              placeholder={t('organizations.create_permission_placeholder')}
              error={Boolean(errors.description)}
              {...register('description')}
            />
          </FormField>
        </form>
      </ModalLayout>
    </ReactModal>
  );
}
export default PermissionModal;
