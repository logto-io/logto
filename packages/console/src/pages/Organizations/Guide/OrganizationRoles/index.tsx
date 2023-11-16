import { type OrganizationRoleWithScopes, Theme, type OrganizationRole } from '@logto/schemas';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

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

import { organizationRolePath } from '../../RoleModal';
import DynamicFormFields from '../DynamicFormFields';
import { steps, totalStepCount } from '../const';
import * as styles from '../index.module.scss';

type Form = {
  roles: Array<Omit<OrganizationRole, 'tenantId' | 'id'> & { scopes: Array<Option<string>> }>;
};

const defaultValue = { name: '', description: '', scopes: [] };

function OrganizationRoles() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.organizations' });
  const theme = useTheme();
  const RbacIcon = theme === Theme.Light ? RbacFeature : RbacFeatureDark;
  const { navigate } = useTenantPathname();
  const api = useApi();
  const { data, error } = useSWR<OrganizationRoleWithScopes[], RequestError>(
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
      roles: [defaultValue],
    },
  });

  useEffect(() => {
    if (data?.length) {
      reset({
        roles: data.map(({ name, description, scopes }) => ({
          name,
          description,
          scopes: scopes.map(({ id, name }) => ({ value: id, title: name })),
        })),
      });
    }
  }, [data, reset]);

  const roleFields = useFieldArray({ control, name: 'roles' });

  const onSubmit = handleSubmit(
    trySubmitSafe(async ({ roles }) => {
      // If the form is pristine then skip the submit and go directly to the next step
      if (!isDirty) {
        navigate(`../${steps.organizationInfo}`);
        return;
      }

      // Remove pre-saved roles
      if (data?.length) {
        await Promise.all(data.map(async ({ id }) => api.delete(`${organizationRolePath}/${id}`)));
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
    navigate(`../${steps.permissions}`);
  };

  return (
    <>
      <OverlayScrollbar className={styles.stepContainer}>
        <div className={classNames(styles.content)}>
          <Card className={styles.card}>
            <RbacIcon className={styles.icon} />
            <div className={styles.section}>
              <div className={styles.title}>{t('guide.step_2')}</div>
              <div className={styles.description}>{t('guide.step_2_description')}</div>
            </div>
            <form>
              <DynamicFormFields
                isLoading={!data && !error}
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
                  roleFields.append(defaultValue);
                }}
                onRemove={roleFields.remove}
              />
            </form>
          </Card>
        </div>
      </OverlayScrollbar>
      <ActionBar step={3} totalSteps={totalStepCount}>
        <Button isLoading={isSubmitting} title="general.next" type="primary" onClick={onSubmit} />
        <Button title="general.back" onClick={onNavigateBack} />
      </ActionBar>
    </>
  );
}

export default OrganizationRoles;
