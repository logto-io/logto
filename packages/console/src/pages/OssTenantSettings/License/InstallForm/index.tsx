import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import Textarea from '@/ds-components/Textarea';
import { trySubmitSafe } from '@/utils/form';

import useInstallLicense from '../use-install-license';

import styles from './index.module.scss';

type FormData = {
  license: string;
};

type Props = {
  /** Whether a license is already installed, i.e. whether submitting replaces one. */
  readonly isReplacing: boolean;
  readonly onCancel?: () => void;
  readonly onInstalled?: () => void;
};

function InstallForm({ isReplacing, onCancel, onInstalled }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { installLicense, errorMessage, clearError } = useInstallLicense();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ defaultValues: { license: '' } });

  const onSubmit = handleSubmit(
    trySubmitSafe(async ({ license }) => {
      if (!(await installLicense(license.trim()))) {
        return;
      }

      reset();
      toast.success(t('tenants.license.installed_toast'));
      onInstalled?.();
    })
  );

  const { onChange, ...licenseField } = register('license', { required: true });

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <FormField
        isRequired
        title="tenants.license.key_field"
        description="tenants.license.key_field_description"
      >
        <Textarea
          {...licenseField}
          rows={6}
          placeholder={t('tenants.license.key_placeholder')}
          error={errorMessage ?? Boolean(errors.license)}
          onChange={(event) => {
            clearError();
            void onChange(event);
          }}
        />
      </FormField>
      <div className={styles.actions}>
        <Button
          htmlType="submit"
          type="primary"
          isLoading={isSubmitting}
          title={isReplacing ? 'tenants.license.replace_button' : 'tenants.license.install_button'}
        />
        {onCancel && <Button title="general.cancel" onClick={onCancel} />}
      </div>
    </form>
  );
}

export default InstallForm;
