import { domainRegEx } from '@logto/core-kit';
import classNames from 'classnames';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/ds-components/Button';
import TextInput from '@/ds-components/TextInput';
import { onKeyDownHandler } from '@/utils/a11y';
import { trySubmitSafe } from '@/utils/form';

import * as styles from './index.module.scss';

type FormData = {
  domain: string;
};

type Props = {
  readonly className?: string;
  readonly isReadonly?: boolean;
  readonly onSubmitCustomDomain: (data: FormData) => Promise<void>;
};

function AddDomainForm({ className, isReadonly, onSubmitCustomDomain }: Props) {
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

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      await onSubmitCustomDomain(formData);
    })
  );

  return (
    <div className={classNames(styles.addDomain, className)}>
      <TextInput
        className={styles.textInput}
        placeholder={t('domain.custom.custom_domain_placeholder')}
        error={errors.domain?.message}
        readOnly={isReadonly}
        onKeyDown={onKeyDownHandler({ Enter: onSubmit })}
        {...register('domain', {
          required: true,
          pattern: {
            value: domainRegEx,
            message: t('domain.custom.invalid_domain_format'),
          },
        })}
      />
      <Button
        className={styles.addButton}
        type="primary"
        title="domain.custom.add_domain"
        isLoading={isSubmitting}
        disabled={domainInput.length === 0 || isReadonly}
        onClick={onSubmit}
      />
    </div>
  );
}

export default AddDomainForm;
