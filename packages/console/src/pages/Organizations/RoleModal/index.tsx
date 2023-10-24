import {
  type OrganizationRole,
  type OrganizationRoleWithScopes,
  type OrganizationScope,
} from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import useSWR from 'swr';

import { defaultPageSize } from '@/consts';
import Button from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import MultiSelect, { type Option } from '@/ds-components/Select/MultiSelect';
import TextInput from '@/ds-components/TextInput';
import useActionTranslation from '@/hooks/use-action-translation';
import useApi, { type RequestError } from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';
import { buildUrl } from '@/utils/url';

const organizationRolePath = 'api/organization-roles';

type Props = {
  isOpen: boolean;
  editData: Nullable<OrganizationRoleWithScopes>;
  onFinish: () => void;
};

/** A modal that allows users to create or edit an organization role. */
function RoleModal({ isOpen, editData, onFinish }: Props) {
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const {
    reset,
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Partial<OrganizationRole> & { scopes: Array<Option<string>> }>({
    defaultValues: { scopes: [] },
  });
  const [keyword, setKeyword] = useState('');
  const {
    data: response,
    error, // TODO: handle error
    mutate,
  } = useSWR<[OrganizationScope[], number], RequestError>(
    buildUrl('api/organization-scopes', {
      page: String(1),
      page_size: String(defaultPageSize),
      q: keyword,
    }),
    { revalidateOnFocus: false }
  );
  const [scopes] = response ?? [[], 0];
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const tAction = useActionTranslation();
  const title = editData
    ? tAction('edit', 'organizations.organization_role')
    : tAction('create', 'organizations.organization_role');
  const action = editData ? t('general.save') : tAction('create', 'organizations.role');

  const submit = handleSubmit(async ({ scopes, ...json }) => {
    setIsLoading(true);
    try {
      // Create or update role
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
      onFinish();
    } finally {
      setIsLoading(false);
    }
  });

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

  // Initial fetch on open
  useEffect(() => {
    if (isOpen) {
      void mutate();
    }
  }, [isOpen, mutate]);

  return (
    <ReactModal
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onFinish}
    >
      <ModalLayout
        title={<DangerousRaw>{title}</DangerousRaw>}
        footer={
          <Button
            type="primary"
            title={<DangerousRaw>{action}</DangerousRaw>}
            isLoading={isLoading}
            onClick={submit}
          />
        }
        onClose={onFinish}
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
            placeholder="organizations.create_role_placeholder"
            error={Boolean(errors.description)}
            {...register('description')}
          />
        </FormField>
        <FormField title="organizations.permission_other">
          <Controller
            name="scopes"
            control={control}
            render={({ field: { onChange, value } }) => (
              <MultiSelect
                value={value}
                options={scopes.map(({ id, name }) => ({ value: id, title: name }))}
                placeholder="organizations.search_permission_placeholder"
                onChange={onChange}
                onSearch={setKeyword}
              />
            )}
          />
        </FormField>
      </ModalLayout>
    </ReactModal>
  );
}
export default RoleModal;
