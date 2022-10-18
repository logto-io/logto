import { usernameRegEx } from '@logto/core-kit';
import { User } from '@logto/schemas';
import { nanoid } from 'nanoid';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import FormField from '@/components/FormField';
import ModalLayout from '@/components/ModalLayout';
import TextInput from '@/components/TextInput';
import useApi from '@/hooks/use-api';

type FormData = {
  username: string;
  name: string;
};

type Props = {
  onClose?: (createdUser?: User, password?: string) => void;
};

const CreateForm = ({ onClose }: Props) => {
  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = useForm<FormData>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const api = useApi();

  const onSubmit = handleSubmit(async (data) => {
    if (isSubmitting) {
      return;
    }

    const password = nanoid(8);

    const createdUser = await api.post('/api/users', { json: { ...data, password } }).json<User>();
    onClose?.(createdUser, password);
  });

  return (
    <ModalLayout
      title="users.create"
      footer={
        <Button
          disabled={isSubmitting}
          htmlType="submit"
          title="users.create"
          size="large"
          type="primary"
          onClick={onSubmit}
        />
      }
      onClose={onClose}
    >
      <form>
        <FormField isRequired title="users.create_form_username">
          <TextInput
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            {...register('username', {
              required: true,
              pattern: {
                value: usernameRegEx,
                message: t('errors.username_pattern_error'),
              },
            })}
            hasError={Boolean(errors.username)}
            errorMessage={errors.username?.message}
          />
        </FormField>
        <FormField title="users.create_form_name">
          <TextInput
            {...register('name')}
            hasError={Boolean(errors.name)}
            errorMessage={errors.name?.message}
          />
        </FormField>
      </form>
    </ModalLayout>
  );
};

export default CreateForm;
