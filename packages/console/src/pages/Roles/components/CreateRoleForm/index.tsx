import { type AdminConsoleKey } from '@logto/phrases';
import type { Role, ScopeResponse } from '@logto/schemas';
import { RoleType, internalRolePrefix } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useContext } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import RoleScopesTransfer from '@/components/RoleScopesTransfer';
import { isDevFeaturesEnabled } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import { trySubmitSafe } from '@/utils/form';
import { isPaidPlan } from '@/utils/subscription';

import Footer from './Footer';
import styles from './index.module.scss';

type RadioOption = { key: AdminConsoleKey; value: RoleType };

const radioOptions: RadioOption[] = [
  { key: 'roles.type_user', value: RoleType.User },
  { key: 'roles.type_machine_to_machine', value: RoleType.MachineToMachine },
];

export type Props = {
  readonly onClose: (createdRole?: Role) => void;
};

type CreateRoleFormData = Pick<Role, 'name' | 'description' | 'type'> & {
  scopes: ScopeResponse[];
};

type CreateRolePayload = Pick<Role, 'name' | 'description' | 'type'> & {
  scopeIds?: string[];
};

function CreateRoleForm({ onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const {
    currentSubscription: { planId, isEnterprisePlan },
    currentSubscriptionBasicQuota: { userRolesLimit, machineToMachineRolesLimit },
  } = useContext(SubscriptionDataContext);

  const isPaidTenant = isPaidPlan(planId, isEnterprisePlan);
  // We need to hide the add-on tag for legacy plans who has unlimited roles.
  const hasRolesIncluded = userRolesLimit === null && machineToMachineRolesLimit === null;

  const {
    control,
    handleSubmit,
    register,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<CreateRoleFormData>({ defaultValues: { type: RoleType.User } });

  const api = useApi();

  const onSubmit = handleSubmit(
    trySubmitSafe(async ({ name, description, type, scopes }) => {
      if (isSubmitting) {
        return;
      }

      const payload: CreateRolePayload = {
        name,
        description,
        type,
        scopeIds: conditional(scopes.length > 0 && scopes.map(({ id }) => id)),
      };

      const createdRole = await api.post('api/roles', { json: payload }).json<Role>();
      onClose(createdRole);
    })
  );

  return (
    <ModalLayout
      title="roles.create_role_title"
      subtitle="roles.create_role_description"
      // TODO: remove the dev feature when the new paywall logic is ready;
      hasAddOnTag={isDevFeaturesEnabled && isPaidTenant && !hasRolesIncluded}
      learnMoreLink={{
        href: 'https://docs.logto.io/docs/recipes/rbac/manage-permissions-and-roles#manage-roles',
        targetBlank: 'noopener',
      }}
      size="large"
      footer={
        <Footer
          roleType={watch('type')}
          scopes={watch('scopes')}
          isCreating={isSubmitting}
          onClickCreate={onSubmit}
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
        <FormField title="roles.role_type">
          <Controller
            name="type"
            control={control}
            render={({ field: { onChange, value, name } }) => (
              <RadioGroup
                name={name}
                className={styles.roleTypes}
                value={value}
                onChange={(value) => {
                  onChange(value);
                }}
              >
                {radioOptions.map(({ key, value }) => (
                  <Radio key={value} title={<DynamicT forKey={key} />} value={value} />
                ))}
              </RadioGroup>
            )}
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
              <RoleScopesTransfer roleType={watch('type')} value={value} onChange={onChange} />
            )}
          />
        </FormField>
      </form>
    </ModalLayout>
  );
}

export default CreateRoleForm;
