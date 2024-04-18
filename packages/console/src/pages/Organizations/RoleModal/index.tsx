import { type OrganizationRole, type OrganizationRoleWithScopes } from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import OrganizationScopesSelect from '@/components/OrganizationScopesSelect';
import Button from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import { type Option } from '@/ds-components/Select/MultiSelect';
import TextInput from '@/ds-components/TextInput';
import useActionTranslation from '@/hooks/use-action-translation';
import useApi from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

export const organizationRolePath = 'api/organization-roles';

type Props = {
  readonly isOpen: boolean;
  readonly editData: Nullable<OrganizationRoleWithScopes>;
  readonly onClose: () => void;
};

/** A modal that allows users to create or edit an organization role. */
function RoleModal({ isOpen, editData, onClose }: Props) {
  const api = useApi();
  const {
    reset,
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Partial<OrganizationRole> & { scopes: Array<Option<string>> }>({
    defaultValues: { scopes: [] },
  });
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const tAction = useActionTranslation();
  const title = editData
    ? tAction('edit', 'organizations.organization_role')
    : tAction('create', 'organizations.organization_role');
  const action = editData ? t('general.save') : tAction('create', 'organizations.role');
  const [keyword, setKeyword] = useState('');

  const submit = handleSubmit(
    trySubmitSafe(async ({ scopes, ...json }) => {
      // Create or update rol e
      const { id } = await (editData
        ? api.patch(`${organizationRolePath}/${editData.id}`, {
            json,
          })
        : api.post(organizationRolePath, {
            json,
          })
      ).json<OrganizationRole>();

      // Update scopes for role
      await api.put(`${organizationRolePath}/${id}/scopes`, {
        json: { organizationScopeIds: scopes.map(({ value }) => value) },
      });
      onClose();
    })
  );

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      reset(
        editData
          ? {
              ...editData,
              scopes: editData.scopes.map(({ id, name }) => ({ value: id, title: name })),
            }
          : { scopes: [] }
      );
      setKeyword('');
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
        <FormField isRequired title="general.name">
          <TextInput
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            placeholder="viewer"
            error={Boolean(errors.name)}
            {...register('name', { required: true })}
          />
        </FormField>
        <FormField title="general.description">
          <TextInput
            placeholder={t('organizations.create_role_placeholder')}
            error={Boolean(errors.description)}
            {...register('description')}
          />
        </FormField>
        <FormField title="organizations.permission_other">
          <Controller
            name="scopes"
            control={control}
            render={({ field: { onChange, value } }) => (
              <OrganizationScopesSelect
                keyword={keyword}
                setKeyword={setKeyword}
                value={value}
                onChange={onChange}
              />
            )}
          />
        </FormField>
      </ModalLayout>
    </ReactModal>
  );
}

export default RoleModal;
