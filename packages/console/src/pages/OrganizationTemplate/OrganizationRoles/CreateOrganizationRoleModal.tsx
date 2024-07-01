import { type AdminConsoleKey } from '@logto/phrases';
import { RoleType, type OrganizationRole } from '@logto/schemas';
import { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

import * as styles from './index.module.scss';

type FormData = Pick<OrganizationRole, 'name' | 'description' | 'type'>;

type RadioOption = { key: AdminConsoleKey; value: RoleType };

const radioOptions: RadioOption[] = [
  { key: 'roles.type_user', value: RoleType.User },
  { key: 'roles.type_machine_to_machine', value: RoleType.MachineToMachine },
];

type Props = {
  readonly isOpen: boolean;
  readonly onClose: (createdOrganizationRole?: OrganizationRole) => void;
};

function CreateOrganizationRoleModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const {
    register,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
  } = useForm<FormData>({ defaultValues: { type: RoleType.User } });

  const onCloseHandler = useCallback(
    (createdData?: OrganizationRole) => {
      // Reset form when modal is closed
      reset();
      onClose(createdData);
    },
    [onClose, reset]
  );

  const api = useApi();

  const submit = handleSubmit(
    trySubmitSafe(async (formData) => {
      const createdData = await api
        .post('api/organization-roles', { json: formData })
        .json<OrganizationRole>();
      toast.success(
        t('organization_template.roles.create_modal.created', { name: createdData.name })
      );
      onCloseHandler(createdData);
    })
  );

  return (
    <ReactModal
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onCloseHandler();
      }}
    >
      <ModalLayout
        title="organization_template.roles.create_modal.title"
        footer={
          <Button
            type="primary"
            title="organization_template.roles.create_modal.create"
            isLoading={isSubmitting}
            onClick={submit}
          />
        }
        className={styles.createModal}
        onClose={onCloseHandler}
      >
        <FormField isRequired title="organization_template.roles.create_modal.name">
          <TextInput
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            placeholder="viewer"
            error={Boolean(errors.name)}
            {...register('name', { required: true })}
          />
        </FormField>
        <FormField title="organization_template.roles.create_modal.description">
          <TextInput
            placeholder={t('organization_role_details.general.description_field_placeholder')}
            error={Boolean(errors.description)}
            {...register('description')}
          />
        </FormField>
        <FormField title="organization_template.roles.create_modal.type">
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
      </ModalLayout>
    </ReactModal>
  );
}

export default CreateOrganizationRoleModal;
