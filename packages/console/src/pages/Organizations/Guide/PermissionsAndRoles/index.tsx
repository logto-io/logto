import {
  type OrganizationRoleWithScopes,
  Theme,
  type OrganizationRole,
  type OrganizationScope,
} from '@logto/schemas';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import PermissionFeatureDark from '@/assets/icons/permission-feature-dark.svg';
import PermissionFeature from '@/assets/icons/permission-feature.svg';
import RbacFeatureDark from '@/assets/icons/rbac-feature-dark.svg';
import RbacFeature from '@/assets/icons/rbac-feature.svg';
import ActionBar from '@/components/ActionBar';
import OrganizationScopesSelect from '@/components/OrganizationScopesSelect';
import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import FormField from '@/ds-components/FormField';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import { type Option } from '@/ds-components/Select/MultiSelect';
import TextInput from '@/ds-components/TextInput';
import useApi, { type RequestError } from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useTheme from '@/hooks/use-theme';
import { trySubmitSafe } from '@/utils/form';

import { organizationScopesPath } from '../../PermissionModal';
import { organizationRolePath } from '../../RoleModal';
import DynamicFormFields from '../DynamicFormFields';
import { steps } from '../const';
import * as styles from '../index.module.scss';

type Form = {
  /* Organization permissions, a.k.a organization scopes */
  permissions: Array<Omit<OrganizationScope, 'id' | 'tenantId'>>;
  roles: Array<Omit<OrganizationRole, 'tenantId' | 'id'> & { scopes: Array<Option<string>> }>;
};

const icons = {
  [Theme.Light]: { PermissionIcon: PermissionFeature, RbacIcon: RbacFeature },
  [Theme.Dark]: { PermissionIcon: PermissionFeatureDark, RbacIcon: RbacFeatureDark },
};

const defaultPermission = { name: '', description: '' };
const defaultRoles = { name: '', description: '', scopes: [] };

function PermissionsAndRoles() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.organizations' });
  const theme = useTheme();
  const { PermissionIcon, RbacIcon } = icons[theme];
  const { navigate } = useTenantPathname();
  const api = useApi();
  const { data: permissionsData, error: permissionsError } = useSWR<
    OrganizationScope[],
    RequestError
  >('api/organization-scopes');
  const { data: rolesData, error: rolesError } = useSWR<OrganizationRoleWithScopes[], RequestError>(
    'api/organization-roles'
  );
  const [keyword, setKeyword] = useState('');

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Form>({
    defaultValues: {
      permissions: [defaultPermission],
      roles: [defaultRoles],
    },
  });

  useEffect(() => {
    if (permissionsData?.length) {
      reset({
        permissions: permissionsData.map(({ name, description }) => ({ name, description })),
      });
    }
  }, [permissionsData, reset]);

  useEffect(() => {
    if (rolesData?.length) {
      reset({
        roles: rolesData.map(({ name, description, scopes }) => ({
          name,
          description,
          scopes: scopes.map(({ id, name }) => ({ value: id, title: name })),
        })),
      });
    }
  }, [rolesData, reset]);

  const permissionFields = useFieldArray({ control, name: 'permissions' });
  const roleFields = useFieldArray({ control, name: 'roles' });

  const onSubmit = handleSubmit(
    trySubmitSafe(async ({ permissions, roles }) => {
      // If user has pre-saved data but with no changes made this time,
      // skip form submit and go directly to the next step.
      if ((Boolean(permissionsData?.length) || Boolean(rolesData?.length)) && !isDirty) {
        navigate(`../${steps.organizationInfo}`);
        return;
      }

      // If there's pre-saved permissions, remove them first
      if (permissionsData?.length) {
        await Promise.all(
          permissionsData.map(async ({ id }) => api.delete(`${organizationScopesPath}/${id}`))
        );
      }
      // Create new permissions
      if (permissions.length > 0) {
        await Promise.all(
          permissions
            .filter(({ name }) => name)
            .map(async ({ name, description }) => {
              await api.post(organizationScopesPath, { json: { name, description } });
            })
        );
      }

      // Remove pre-saved roles
      if (rolesData?.length) {
        await Promise.all(
          rolesData.map(async ({ id }) => api.delete(`${organizationRolePath}/${id}`))
        );
      }
      // Create new roles
      if (roles.length > 0) {
        await Promise.all(
          roles
            .filter(({ name }) => name)
            .map(async ({ name, description, scopes }) => {
              const { id } = await api
                .post(organizationRolePath, { json: { name, description } })
                .json<OrganizationRole>();

              if (scopes.length > 0) {
                await api.put(`${organizationRolePath}/${id}/scopes`, {
                  json: { organizationScopeIds: scopes.map(({ value }) => value) },
                });
              }
            })
        );
      }

      navigate(`../${steps.organizationInfo}`);
    })
  );

  const onNavigateBack = () => {
    reset();
    setKeyword('');
    navigate(`../${steps.introduction}`);
  };

  return (
    <>
      <OverlayScrollbar className={styles.stepContainer}>
        <div className={classNames(styles.content)}>
          <Card className={styles.card}>
            <PermissionIcon className={styles.icon} />
            <div className={styles.title}>{t('guide.step_1')}</div>
            <form>
              <DynamicFormFields
                isLoading={!permissionsData && !permissionsError}
                title="organizations.guide.organization_permissions"
                fields={permissionFields.fields}
                render={(index) => (
                  <div className={styles.fieldGroup}>
                    <FormField title="organizations.guide.permission_name">
                      <TextInput
                        {...register(`permissions.${index}.name`)}
                        error={Boolean(errors.permissions?.[index]?.name)}
                        placeholder="read:appointment"
                      />
                    </FormField>
                    <FormField title="general.description">
                      <TextInput
                        {...register(`permissions.${index}.description`)}
                        placeholder={t('create_permission_placeholder')}
                      />
                    </FormField>
                  </div>
                )}
                onAdd={() => {
                  permissionFields.append(defaultPermission);
                }}
                onRemove={permissionFields.remove}
              />
            </form>
          </Card>
          <Card className={styles.card}>
            <RbacIcon className={styles.icon} />
            <div className={styles.section}>
              <div className={styles.title}>{t('guide.step_2')}</div>
              <div className={styles.description}>{t('guide.step_2_description')}</div>
            </div>
            <form>
              <DynamicFormFields
                isLoading={!rolesData && !rolesError}
                title="organizations.guide.organization_roles"
                fields={roleFields.fields}
                render={(index) => (
                  <div className={styles.fieldGroup}>
                    <FormField title="organizations.guide.role_name">
                      <TextInput
                        {...register(`roles.${index}.name`)}
                        error={Boolean(errors.roles?.[index]?.name)}
                        placeholder="viewer"
                      />
                    </FormField>
                    <FormField title="general.description">
                      <TextInput
                        {...register(`roles.${index}.description`)}
                        placeholder={t('create_role_placeholder')}
                      />
                    </FormField>
                    <FormField title="organizations.guide.permissions">
                      <Controller
                        name={`roles.${index}.scopes`}
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
                  </div>
                )}
                onAdd={() => {
                  roleFields.append(defaultRoles);
                }}
                onRemove={roleFields.remove}
              />
            </form>
          </Card>
        </div>
      </OverlayScrollbar>
      <ActionBar step={2} totalSteps={3}>
        <Button isLoading={isSubmitting} title="general.next" type="primary" onClick={onSubmit} />
        <Button title="general.back" onClick={onNavigateBack} />
      </ActionBar>
    </>
  );
}

export default PermissionsAndRoles;
