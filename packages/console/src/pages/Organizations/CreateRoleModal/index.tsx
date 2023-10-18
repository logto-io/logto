import { type OrganizationScope } from '@logto/schemas';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ReactModal from 'react-modal';
import useSWR from 'swr';

import { defaultPageSize } from '@/consts';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import MultiSelect, { type Option } from '@/ds-components/Select/MultiSelect';
import TextInput from '@/ds-components/TextInput';
import useApi, { type RequestError } from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';
import { buildUrl } from '@/utils/url';

type Props = {
  isOpen: boolean;
  onFinish: () => void;
};

function CreateRoleModal({ isOpen, onFinish }: Props) {
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const {
    reset,
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<{ name: string; description?: string; scopes: Array<Option<string>> }>({
    defaultValues: { name: '', scopes: [] },
  });
  const [keyword, setKeyword] = useState('');
  const {
    data: response,
    error, // TODO: handle error
    mutate,
  } = useSWR<[OrganizationScope[], number], RequestError>(
    buildUrl('api/organization-scopes', {
      page: String(1),
      page_size: String(defaultPageSize),
      q: keyword,
    }),
    { revalidateOnFocus: false }
  );
  const [scopes] = response ?? [[], 0];

  const addRole = handleSubmit(async ({ scopes, ...json }) => {
    setIsLoading(true);
    try {
      await api.post('api/organization-roles', {
        json: {
          ...json,
          organizationScopeIds: scopes.map(({ value }) => value),
        },
      });
      onFinish();
    } finally {
      setIsLoading(false);
    }
  });

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  // Initial fetch on open
  useEffect(() => {
    if (isOpen) {
      void mutate();
    }
  }, [isOpen, mutate]);

  return (
    <ReactModal
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onFinish}
    >
      <ModalLayout
        title="organizations.create_organization_role"
        footer={
          <Button
            type="primary"
            title="organizations.create_role"
            isLoading={isLoading}
            onClick={addRole}
          />
        }
        onClose={onFinish}
      >
        <FormField isRequired title="general.name">
          <TextInput
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            placeholder="viewer"
            error={Boolean(errors.name)}
            {...register('name', { required: true })}
          />
        </FormField>
        <FormField title="general.description">
          <TextInput
            placeholder="organizations.create_role_placeholder"
            error={Boolean(errors.description)}
            {...register('description')}
          />
        </FormField>
        <FormField title="organizations.permission_other">
          <Controller
            name="scopes"
            control={control}
            render={({ field: { onChange, value } }) => (
              <MultiSelect
                value={value}
                options={scopes.map(({ id, name }) => ({ value: id, title: name }))}
                placeholder="organizations.search_permission_placeholder"
                onChange={onChange}
                onSearch={setKeyword}
              />
            )}
          />
        </FormField>
      </ModalLayout>
    </ReactModal>
  );
}
export default CreateRoleModal;
