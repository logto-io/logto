import { Theme, type OrganizationScope } from '@logto/schemas';
import classNames from 'classnames';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import PermissionFeatureDark from '@/assets/icons/permission-feature-dark.svg';
import PermissionFeature from '@/assets/icons/permission-feature.svg';
import ActionBar from '@/components/ActionBar';
import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import FormField from '@/ds-components/FormField';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import TextInput from '@/ds-components/TextInput';
import useApi, { type RequestError } from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useTheme from '@/hooks/use-theme';
import { trySubmitSafe } from '@/utils/form';

import { organizationScopesPath } from '../../PermissionModal';
import DynamicFormFields from '../DynamicFormFields';
import { steps, totalStepCount } from '../const';
import * as styles from '../index.module.scss';

type Form = {
  /* Organization permissions, a.k.a organization scopes */
  permissions: Array<Omit<OrganizationScope, 'id' | 'tenantId'>>;
};

const defaultValue = { name: '', description: '' };

function OrganizationPermissions() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.organizations' });
  const theme = useTheme();
  const PermissionIcon = theme === Theme.Light ? PermissionFeature : PermissionFeatureDark;
  const { navigate } = useTenantPathname();
  const api = useApi();
  const { data, error } = useSWR<OrganizationScope[], RequestError>('api/organization-scopes');

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Form>({
    defaultValues: {
      permissions: [defaultValue],
    },
  });

  useEffect(() => {
    if (data?.length) {
      reset({
        permissions: data.map(({ name, description }) => ({ name, description })),
      });
    }
  }, [data, reset]);

  const permissionFields = useFieldArray({ control, name: 'permissions' });

  const onSubmit = handleSubmit(
    trySubmitSafe(async ({ permissions }) => {
      // If the form is pristine then skip the submit and go directly to the next step
      if (!isDirty) {
        navigate(`../${steps.roles}`);
        return;
      }

      // If there's pre-saved permissions, remove them first
      if (data?.length) {
        await Promise.all(
          data.map(async ({ id }) => api.delete(`${organizationScopesPath}/${id}`))
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

      navigate(`../${steps.roles}`);
    })
  );

  const onNavigateBack = () => {
    reset();
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
                isLoading={!data && !error}
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
                  permissionFields.append(defaultValue);
                }}
                onRemove={permissionFields.remove}
              />
            </form>
          </Card>
        </div>
      </OverlayScrollbar>
      <ActionBar step={2} totalSteps={totalStepCount}>
        <Button isLoading={isSubmitting} title="general.next" type="primary" onClick={onSubmit} />
        <Button title="general.back" onClick={onNavigateBack} />
      </ActionBar>
    </>
  );
}

export default OrganizationPermissions;
