import { type OrganizationScope } from '@logto/schemas';
import { cond, type Nullable } from '@silverhand/essentials';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

type Props = {
  /**
   * The organization permission data to edit. If null, the modal will be in create mode.
   */
  readonly data: Nullable<OrganizationScope>;
  readonly onClose: () => void;
};

type FormData = Pick<OrganizationScope, 'name' | 'description'>;

const organizationScopesPath = 'api/organization-scopes';

/** A modal that allows users to create or edit an organization permission. */
function ManageOrganizationPermissionModal({ data, onClose }: Props) {
  const isCreateMode = data === null;

  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });

  const api = useApi();

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<FormData>(cond(data && { defaultValues: data }));

  const submit = handleSubmit(
    trySubmitSafe(async (json) => {
      await (isCreateMode
        ? api.post(organizationScopesPath, {
            json,
          })
        : api.patch(`${organizationScopesPath}/${data.id}`, {
            json,
          }));
      toast.success(
        t(isCreateMode ? 'organization_template.permissions.created' : 'general.saved', {
          name: json.name,
        })
      );
      onClose();
    })
  );

  return (
    <ReactModal
      isOpen
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onClose}
    >
      <ModalLayout
        title={`organization_template.permissions.${isCreateMode ? 'create' : 'edit'}_title`}
        footer={
          <>
            {!isCreateMode && (
              <Button title="general.cancel" isLoading={isSubmitting} onClick={onClose} />
            )}
            <Button
              type="primary"
              title={
                isCreateMode
                  ? 'organization_template.permissions.create_permission'
                  : 'general.save'
              }
              isLoading={isSubmitting}
              onClick={submit}
            />
          </>
        }
        onClose={onClose}
      >
        <FormField isRequired title="organization_template.permissions.permission_field_name">
          <TextInput
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={isCreateMode}
            readOnly={!isCreateMode}
            placeholder="read:appointment"
            error={Boolean(errors.name)}
            {...register('name', { required: true })}
          />
        </FormField>
        <FormField title="organization_template.permissions.description_field_name">
          <TextInput
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={!isCreateMode}
            placeholder={t('organization_template.permissions.description_field_placeholder')}
            error={Boolean(errors.description)}
            {...register('description')}
          />
        </FormField>
      </ModalLayout>
    </ReactModal>
  );
}

export default ManageOrganizationPermissionModal;
