import { type Domain } from '@logto/schemas';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import TextInput from '@/components/TextInput';
import useApi from '@/hooks/use-api';
import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './index.module.scss';

const subdomainRegex = /^[\dA-Za-z][\dA-Za-z-]*[\dA-Za-z](\.[\dA-Za-z][\dA-Za-z-]*[\dA-Za-z]){2,}$/;

type FormData = {
  domain: string;
};

type Props = {
  onCustomDomainAdded: (domain: Domain) => void;
};

function AddDomainForm({ onCustomDomainAdded }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    register,
    watch,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<FormData>({
    defaultValues: {
      domain: '',
    },
  });

  const domainInput = watch('domain');

  const api = useApi();

  const onSubmit = handleSubmit(async (formData) => {
    const createdDomain = await api.post('api/domains', { json: formData }).json<Domain>();
    onCustomDomainAdded(createdDomain);
  });

  return (
    <div className={styles.addDomain}>
      <TextInput
        className={styles.textInput}
        placeholder={t('domain.custom.custom_domain_placeholder')}
        error={errors.domain?.message}
        onKeyDown={onKeyDownHandler({ Enter: onSubmit })}
        {...register('domain', {
          required: true,
          pattern: {
            value: subdomainRegex,
            message: t('domain.custom.invalid_domain_format'),
          },
        })}
      />
      <Button
        className={styles.addButton}
        type="primary"
        title="domain.custom.add_domain"
        isLoading={isSubmitting}
        disabled={domainInput.length === 0}
        onClick={onSubmit}
      />
    </div>
  );
}

export default AddDomainForm;
