import type { Role } from '@logto/schemas';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import FormField from '@/components/FormField';
import ModalLayout from '@/components/ModalLayout';
import TextInput from '@/components/TextInput';
import useApi from '@/hooks/use-api';

export type Props = {
  onClose: (createdRole?: Role) => void;
};

type CreateRoleFormData = Pick<Role, 'name' | 'description'>;

const CreateRoleForm = ({ onClose }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    handleSubmit,
    register,
    formState: { isSubmitting },
  } = useForm<CreateRoleFormData>();

  const api = useApi();

  const onSubmit = handleSubmit(async (formData) => {
    if (isSubmitting) {
      return;
    }

    const createdRole = await api.post('/api/roles', { json: formData }).json<Role>();
    onClose(createdRole);
  });

  return (
    <ModalLayout
      title="roles.create_role_title"
      subtitle="roles.create_role_description"
      footer={
        <Button
          isLoading={isSubmitting}
          htmlType="submit"
          title="roles.create_role_button"
          size="large"
          type="primary"
          onClick={onSubmit}
        />
      }
      onClose={onClose}
    >
      <form>
        <FormField isRequired title="roles.role_name">
          <TextInput
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            {...register('name', { required: true })}
          />
        </FormField>
        <FormField title="roles.role_description">
          <TextInput {...register('description')} />
        </FormField>
      </form>
    </ModalLayout>
  );
};

export default CreateRoleForm;
