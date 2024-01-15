import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';

import * as styles from './index.module.scss';

function ProtectedAppForm() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.protected_app' });
  const {
    register,
    formState: { errors },
  } = useFormContext<ProtectedAppForm>();

  return (
    <>
      <FormField isRequired title="protected_app.form.domain_field_label">
        <div className={styles.fieldWrapper}>
          <TextInput
            className={styles.subdomain}
            {...register('subDomain', { required: true })}
            placeholder={t('form.domain_field_placeholder')}
            error={Boolean(errors.subDomain)}
          />
          {/** TODO: @charles Hard-coded for now, will update to read from API later. */}
          <div className={styles.domain}>.protected.app</div>
        </div>
      </FormField>
      <FormField isRequired title="protected_app.form.url_field_label">
        <TextInput
          {...register('origin', { required: true })}
          placeholder={t('form.url_field_placeholder')}
          error={Boolean(errors.origin)}
        />
      </FormField>
    </>
  );
}

export default ProtectedAppForm;
