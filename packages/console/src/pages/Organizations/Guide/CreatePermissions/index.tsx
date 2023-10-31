import { type OrganizationScope, Theme } from '@logto/schemas';
import classNames from 'classnames';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import OrganizationFeatureDark from '@/assets/icons/organization-feature-dark.svg';
import OrganizationFeature from '@/assets/icons/organization-feature.svg';
import PermissionFeatureDark from '@/assets/icons/permission-feature-dark.svg';
import PermissionFeature from '@/assets/icons/permission-feature.svg';
import workflowImage from '@/assets/images/organization-workflow.webp';
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
import { steps } from '../const';
import * as styles from '../index.module.scss';

const icons = {
  [Theme.Light]: { OrganizationIcon: OrganizationFeature, PermissionIcon: PermissionFeature },
  [Theme.Dark]: {
    OrganizationIcon: OrganizationFeatureDark,
    PermissionIcon: PermissionFeatureDark,
  },
};

type PermissionForm = {
  permissions: Array<Omit<OrganizationScope, 'id' | 'tenantId'>>;
};

const defaultPermission = { name: '', description: '' };

function CreatePermissions() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.organizations.guide' });
  const theme = useTheme();
  const { OrganizationIcon, PermissionIcon } = icons[theme];
  const { navigate } = useTenantPathname();
  const api = useApi();
  const { data, error } = useSWR<OrganizationScope[], RequestError>('api/organization-scopes');

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PermissionForm>({
    defaultValues: {
      permissions: [defaultPermission],
    },
  });

  useEffect(() => {
    if (data?.length) {
      reset({ permissions: data.map(({ name, description }) => ({ name, description })) });
    }
  }, [data, reset]);

  const { fields, append, remove } = useFieldArray({ control, name: 'permissions' });

  const onSubmit = handleSubmit(
    trySubmitSafe(async ({ permissions }) => {
      // If user has pre-saved data and no changes, skip submit and go directly to next step
      if (data?.length && !isDirty) {
        navigate(`../${steps.createRoles}`);
        return;
      }

      if (data?.length) {
        await Promise.all(
          data.map(async ({ id }) => api.delete(`${organizationScopesPath}/${id}`))
        );
      }
      await Promise.all(
        permissions.map(async ({ name, description }) => {
          await api.post(organizationScopesPath, { json: { name, description } });
        })
      );

      navigate(`../${steps.createRoles}`);
    })
  );

  return (
    <>
      <OverlayScrollbar className={styles.stepContainer}>
        <div className={classNames(styles.content)}>
          <Card className={styles.card}>
            <OrganizationIcon className={styles.icon} />
            <div className={styles.title}>{t('brief_title')}</div>
            <img className={styles.image} src={workflowImage} alt="Organization workflow" />
            <div className={styles.description}>{t('brief_introduction')}</div>
          </Card>
          <Card className={styles.card}>
            <PermissionIcon className={styles.icon} />
            <div className={styles.title}>{t('step_1')}</div>
            <form>
              <DynamicFormFields
                isLoading={!data && !error}
                title="organizations.guide.organization_permissions"
                fields={fields}
                render={(index) => (
                  <div className={styles.fieldGroup}>
                    <FormField isRequired title="organizations.guide.permission_name">
                      <TextInput
                        {...register(`permissions.${index}.name`, { required: true })}
                        error={Boolean(errors.permissions?.[index]?.name)}
                      />
                    </FormField>
                    <FormField title="general.description">
                      <TextInput {...register(`permissions.${index}.description`)} />
                    </FormField>
                  </div>
                )}
                onAdd={() => {
                  append(defaultPermission);
                }}
                onRemove={remove}
              />
            </form>
          </Card>
        </div>
      </OverlayScrollbar>
      <ActionBar step={1} totalSteps={3}>
        <Button isLoading={isSubmitting} title="general.next" type="primary" onClick={onSubmit} />
      </ActionBar>
    </>
  );
}

export default CreatePermissions;
