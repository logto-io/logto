import { type AdminConsoleKey } from '@logto/phrases';
import type { Role, ScopeResponse } from '@logto/schemas';
import { RoleType, internalRolePrefix } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useContext, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import KeyboardArrowDown from '@/assets/icons/keyboard-arrow-down.svg';
import KeyboardArrowUp from '@/assets/icons/keyboard-arrow-up.svg';
import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import PlanName from '@/components/PlanName';
import ProTag from '@/components/ProTag';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import RoleScopesTransfer from '@/components/RoleScopesTransfer';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import useSubscriptionPlan from '@/hooks/use-subscription-plan';
import { ReservedPlanName } from '@/types/subscriptions';
import { trySubmitSafe } from '@/utils/form';
import { hasReachedQuotaLimit } from '@/utils/quota';

import * as styles from './index.module.scss';

const radioOptions: Array<{ key: AdminConsoleKey; value: RoleType; proTagCheck: boolean }> = [
  { key: 'roles.type_user', value: RoleType.User, proTagCheck: false },
  { key: 'roles.type_machine_to_machine', value: RoleType.MachineToMachine, proTagCheck: true },
];

export type Props = {
  totalRoleCount: number;
  onClose: (createdRole?: Role) => void;
};

type CreateRoleFormData = Pick<Role, 'name' | 'description' | 'type'> & {
  scopes: ScopeResponse[];
};

type CreateRolePayload = Pick<Role, 'name' | 'description' | 'type'> & {
  scopeIds?: string[];
};

function CreateRoleForm({ totalRoleCount, onClose }: Props) {
  const { currentTenantId } = useContext(TenantsContext);
  const [isTypeSelectorVisible, setIsTypeSelectorVisible] = useState(false);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data: currentPlan } = useSubscriptionPlan(currentTenantId);
  const isM2mDisabledForCurrentPlan = isCloud && currentPlan?.quota.machineToMachineLimit === 0;
  const {
    control,
    handleSubmit,
    register,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<CreateRoleFormData>({ defaultValues: { type: RoleType.User } });

  const api = useApi();
  const roleScopes = watch('scopes', []);

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

  const isRolesReachLimit = hasReachedQuotaLimit({
    quotaKey: 'rolesLimit',
    plan: currentPlan,
    usage: totalRoleCount,
  });

  const isScopesPerReachLimit = hasReachedQuotaLimit({
    quotaKey: 'scopesPerRoleLimit',
    plan: currentPlan,
    /**
     * If usage is equal to the limit, it means the current role has reached the maximum allowed scope.
     * Therefore, we should not assign any more scopes at this point.
     * However, the currently selected scopes haven't been assigned yet, so we subtract 1
     * to allow the assignment when the scope count is equal to the limit.
     */
    usage: roleScopes.length - 1,
  });

  return (
    <ModalLayout
      title="roles.create_role_title"
      subtitle="roles.create_role_description"
      learnMoreLink="https://docs.logto.io/docs/recipes/rbac/manage-permissions-and-roles#manage-roles"
      size="large"
      footer={(() => {
        if (
          currentPlan?.name === ReservedPlanName.Free &&
          watch('type') === RoleType.MachineToMachine
        ) {
          return (
            <QuotaGuardFooter>
              <Trans
                components={{
                  a: <ContactUsPhraseLink />,
                }}
              >
                {t('upsell.paywall.machine_to_machine_feature')}
              </Trans>
            </QuotaGuardFooter>
          );
        }
        if (isRolesReachLimit && currentPlan) {
          return (
            <QuotaGuardFooter>
              <Trans
                components={{
                  a: <ContactUsPhraseLink />,
                  planName: <PlanName name={currentPlan.name} />,
                }}
              >
                {t('upsell.paywall.roles', { count: currentPlan.quota.rolesLimit ?? 0 })}
              </Trans>
            </QuotaGuardFooter>
          );
        }
        if (isScopesPerReachLimit && currentPlan && !isRolesReachLimit) {
          return (
            <QuotaGuardFooter>
              <Trans
                components={{
                  a: <ContactUsPhraseLink />,
                  planName: <PlanName name={currentPlan.name} />,
                }}
              >
                {t('upsell.paywall.scopes_per_role', {
                  count: currentPlan.quota.scopesPerRoleLimit ?? 0,
                })}
              </Trans>
            </QuotaGuardFooter>
          );
        }
        if (!isRolesReachLimit && !isScopesPerReachLimit) {
          return (
            <Button
              isLoading={isSubmitting}
              htmlType="submit"
              title="roles.create_role_button"
              size="large"
              type="primary"
              onClick={onSubmit}
            />
          );
        }
      })()}
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
          <Button
            type="text"
            size="small"
            title={
              isTypeSelectorVisible
                ? 'roles.hide_role_type_button_text'
                : 'roles.show_role_type_button_text'
            }
            trailingIcon={
              <div className={styles.trailingIcon}>
                {isTypeSelectorVisible ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </div>
            }
            className={styles.roleTypeSelectionSwitch}
            onClick={() => {
              setIsTypeSelectorVisible(!isTypeSelectorVisible);
            }}
          />
        </FormField>
        {isDevFeaturesEnabled && isTypeSelectorVisible && (
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
                  {radioOptions.map(({ key, value, proTagCheck }) => (
                    <Radio
                      key={value}
                      title={<DynamicT forKey={key} />}
                      value={value}
                      trailingIcon={
                        proTagCheck &&
                        isM2mDisabledForCurrentPlan && <ProTag className={styles.proTag} />
                      }
                    />
                  ))}
                </RadioGroup>
              )}
            />
          </FormField>
        )}
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
