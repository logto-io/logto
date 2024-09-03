import { type Organization, type Application, ApplicationType, RoleType } from '@logto/schemas';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import EntitiesTransfer from '@/components/EntitiesTransfer';
import { ApplicationItem } from '@/components/EntitiesTransfer/components/EntityItem';
import OrganizationRolesSelect from '@/components/OrganizationRolesSelect';
import Button from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import { type Option } from '@/ds-components/Select/MultiSelect';
import useActionTranslation from '@/hooks/use-action-translation';
import useApi from '@/hooks/use-api';
import modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

type Props = {
  readonly organization: Organization;
  readonly isOpen: boolean;
  readonly onClose: () => void;
};

function AddAppsToOrganization({ organization, isOpen, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const tAction = useActionTranslation();
  const api = useApi();
  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<{
    applications: Application[];
    roles: Array<Option<string>>;
  }>({
    defaultValues: { applications: [], roles: [] },
  });
  const [keyword, setKeyword] = useState('');

  const onSubmit = handleSubmit(
    trySubmitSafe(async ({ applications, roles }) => {
      await api.post(`api/organizations/${organization.id}/applications`, {
        json: {
          applicationIds: applications.map(({ id }) => id),
        },
      });

      if (roles.length > 0) {
        await api.post(`api/organizations/${organization.id}/applications/roles`, {
          json: {
            applicationIds: applications.map(({ id }) => id),
            organizationRoleIds: roles.map(({ value }) => value),
          },
        });
      }
      onClose();
    })
  );

  useEffect(() => {
    if (isOpen) {
      reset();
      setKeyword('');
    }
  }, [isOpen, reset]);

  return (
    <ReactModal
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onClose}
    >
      <ModalLayout
        size="large"
        title={
          <DangerousRaw>
            {t('organization_details.add_applications_to_organization', {
              name: organization.name,
            })}
          </DangerousRaw>
        }
        subtitle="organization_details.add_applications_to_organization_description"
        footer={
          <Button
            isLoading={isSubmitting}
            size="large"
            type="primary"
            title={<>{tAction('add', 'organization_details.application_other')}</>}
            onClick={onSubmit}
          />
        }
        onClose={onClose}
      >
        <FormField title="organization_details.application_other">
          <Controller
            name="applications"
            control={control}
            rules={{
              validate: (value) => {
                if (value.length === 0) {
                  return t('organization_details.at_least_one_application');
                }
                return true;
              },
            }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <EntitiesTransfer
                errorMessage={error?.message}
                searchProps={{
                  pathname: 'api/applications',
                  parameters: {
                    excludeOrganizationId: organization.id,
                    types: ApplicationType.MachineToMachine,
                  },
                }}
                selectedEntities={value}
                emptyPlaceholder="errors.empty"
                renderEntity={(entity) => <ApplicationItem entity={entity} />}
                onChange={onChange}
              />
            )}
          />
        </FormField>
        <FormField title="organization_details.add_with_organization_role">
          <Controller
            name="roles"
            control={control}
            render={({ field: { onChange, value } }) => (
              <OrganizationRolesSelect
                keyword={keyword}
                setKeyword={setKeyword}
                value={value}
                roleType={RoleType.MachineToMachine}
                onChange={onChange}
              />
            )}
          />
        </FormField>
      </ModalLayout>
    </ReactModal>
  );
}

export default AddAppsToOrganization;
