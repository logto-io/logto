import type { Role, ScopeResponse } from '@logto/schemas';
import { internalRolePrefix } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import FormField from '@/components/FormField';
import ModalLayout from '@/components/ModalLayout';
import RoleScopesTransfer from '@/components/RoleScopesTransfer';
import TextInput from '@/components/TextInput';
import useApi from '@/hooks/use-api';
import useConfigs from '@/hooks/use-configs';

export type Props = {
  onClose: (createdRole?: Role) => void;
};

type CreateRoleFormData = Pick<Role, 'name' | 'description'> & {
  scopes: ScopeResponse[];
};

type CreateRolePayload = Pick<Role, 'name' | 'description'> & {
  scopeIds?: string[];
};

function CreateRoleForm({ onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    control,
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = useForm<CreateRoleFormData>();

  const api = useApi();
  const { updateConfigs } = useConfigs();

  const onSubmit = handleSubmit(async ({ name, description, scopes }) => {
    if (isSubmitting) {
      return;
    }

    const payload: CreateRolePayload = {
      name,
      description,
      scopeIds: conditional(scopes.length > 0 && scopes.map(({ id }) => id)),
    };

    const createdRole = await api.post('api/roles', { json: payload }).json<Role>();
    await updateConfigs({ roleCreated: true });
    onClose(createdRole);
  });

  return (
    <ModalLayout
      title="roles.create_role_title"
      subtitle="roles.create_role_description"
      learnMoreLink="https://docs.logto.io/docs/recipes/rbac/manage-permissions-and-roles#manage-roles"
      size="large"
      footer={
        <Button
          isLoading={isSubmitting}
          htmlType="submit"
          title="roles.create_role_button"
          size="large"
          type="primary"
          onClick={onSubmit}
        />
      }
      onClose={onClose}
    >
      <form>
        <FormField isRequired title="roles.role_name">
          <TextInput
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            {...register('name', {
              required: true,
              validate: (name) =>
                name.startsWith(internalRolePrefix)
                  ? t('errors.create_internal_role_violation')
                  : true,
            })}
            placeholder={t('roles.role_name_placeholder')}
            error={errors.name?.message}
          />
        </FormField>
        <FormField isRequired title="roles.role_description">
          <TextInput
            {...register('description', { required: true })}
            placeholder={t('roles.role_description_placeholder')}
            error={Boolean(errors.description)}
          />
        </FormField>
        <FormField title="roles.assign_permissions">
          <Controller
            control={control}
            name="scopes"
            defaultValue={[]}
            render={({ field: { value, onChange } }) => (
              <RoleScopesTransfer value={value} onChange={onChange} />
            )}
          />
        </FormField>
      </form>
    </ModalLayout>
  );
}

export default CreateRoleForm;
