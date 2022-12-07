import type { Resource } from '@logto/schemas';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import FormField from '@/components/FormField';
import ModalLayout from '@/components/ModalLayout';
import TextInput from '@/components/TextInput';
import useApi from '@/hooks/use-api';

type FormData = {
  name: string;
  indicator: string;
};

type Props = {
  onClose?: (createdApiResource?: Resource) => void;
};

const CreateForm = ({ onClose }: Props) => {
  const {
    handleSubmit,
    register,
    formState: { isSubmitting },
  } = useForm<FormData>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const api = useApi();

  const onSubmit = handleSubmit(async (data) => {
    if (isSubmitting) {
      return;
    }

    const createdApiResource = await api.post('/api/resources', { json: data }).json<Resource>();
    onClose?.(createdApiResource);
  });

  return (
    <ModalLayout
      title="api_resources.create"
      subtitle="api_resources.subtitle"
      footer={
        <Button
          isLoading={isSubmitting}
          htmlType="submit"
          title="api_resources.create"
          size="large"
          type="primary"
          onClick={onSubmit}
        />
      }
      onClose={onClose}
    >
      <form>
        <FormField isRequired title="api_resources.api_name">
          <TextInput
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            {...register('name', { required: true })}
            placeholder={t('api_resources.api_name_placeholder')}
          />
        </FormField>
        <FormField
          isRequired
          title="api_resources.api_identifier"
          tip="api_resources.api_identifier_tip"
        >
          <TextInput
            {...register('indicator', { required: true })}
            placeholder={t('api_resources.api_identifier_placeholder')}
          />
        </FormField>
      </form>
    </ModalLayout>
  );
};

export default CreateForm;
