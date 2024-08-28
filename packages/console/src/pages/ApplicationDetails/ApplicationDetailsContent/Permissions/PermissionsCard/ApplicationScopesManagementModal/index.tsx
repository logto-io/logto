import { ApplicationUserConsentScopeType } from '@logto/schemas';
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

import { type ScopesTableRowDataType, type UserScopeTableRowDataType } from '../use-scopes-table';

/**
 * ApplicationScopesManagementModal
 *
 * This modal is used to edit the resource and organization scopes' descriptions.
 */
export type EditableScopeData = Exclude<ScopesTableRowDataType, UserScopeTableRowDataType>;

type Props = {
  readonly scope?: EditableScopeData;
  readonly onClose: () => void;
  readonly onSubmit: (scope: EditableScopeData) => void;
};

function ApplicationScopesManagementModal({ scope, onClose, onSubmit }: Props) {
  const api = useApi();

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditableScopeData>();

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const tAction = useActionTranslation();

  const onSubmitHandler = handleSubmit(trySubmitSafe(onSubmit));

  // Reset form on open
  useEffect(() => {
    if (scope) {
      reset(scope);
    }
  }, [reset, scope]);

  return (
    <ReactModal
      isOpen={Boolean(scope)}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onClose}
    >
      {scope && (
        <ModalLayout
          title={
            scope.type === ApplicationUserConsentScopeType.ResourceScopes ? (
              'api_resource_details.permission.edit_title'
            ) : (
              <DangerousRaw>
                {tAction('edit', 'organizations.organization_permission')}
              </DangerousRaw>
            )
          }
          subtitle={
            scope.type === ApplicationUserConsentScopeType.ResourceScopes ? (
              <DangerousRaw>
                {t('api_resource_details.permission.edit_subtitle', {
                  resourceName: scope.resourceName,
                })}
              </DangerousRaw>
            ) : undefined
          }
          learnMoreLink={
            scope.type === ApplicationUserConsentScopeType.ResourceScopes
              ? {
                  href: 'https://docs.logto.io/docs/recipes/rbac/manage-permissions-and-roles#manage-role-permissions',
                  targetBlank: 'noopener',
                }
              : undefined
          }
          footer={
            <Button
              isLoading={isSubmitting}
              htmlType="submit"
              type="primary"
              size="large"
              title="general.save"
              onClick={onSubmitHandler}
            />
          }
          onClose={onClose}
        >
          <form>
            <FormField isRequired title="general.name">
              <TextInput
                disabled
                error={Boolean(errors.name)}
                {...register('name', { required: true })}
              />
            </FormField>
            <FormField
              title="general.description"
              isRequired={scope.type === ApplicationUserConsentScopeType.ResourceScopes}
              tip={t('application_details.permissions.permission_description_tips')}
            >
              <TextInput
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                placeholder={
                  scope.type === ApplicationUserConsentScopeType.ResourceScopes
                    ? t('api_resource_details.permission.description_placeholder')
                    : t('organizations.create_permission_placeholder')
                }
                error={Boolean(errors.description)}
                {...register('description', {
                  required: scope.type === ApplicationUserConsentScopeType.ResourceScopes,
                })}
              />
            </FormField>
          </form>
        </ModalLayout>
      )}
    </ReactModal>
  );
}

export default ApplicationScopesManagementModal;
