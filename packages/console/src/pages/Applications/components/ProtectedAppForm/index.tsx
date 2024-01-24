import { ApplicationType, type Application } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWRImmutable from 'swr/immutable';

import Button, { type Props as ButtonProps } from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import { trySubmitSafe } from '@/utils/form';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  buttonAlignment?: 'left' | 'right';
  buttonText?: ButtonProps['title'];
  buttonSize?: ButtonProps['size'];
  hasDetailedInstructions?: boolean;
  hasRequiredLabel?: boolean;
  onCreateSuccess?: (createdApp: Application) => void;
};

function ProtectedAppForm({
  className,
  buttonAlignment = 'right',
  buttonSize = 'large',
  buttonText = 'protected_app.form.create_application',
  hasDetailedInstructions,
  hasRequiredLabel,
  onCreateSuccess,
}: Props) {
  const { data } = useSWRImmutable<ProtectedAppsDomainConfig>('api/systems/application');
  const defaultDomain = data?.protectedApps.defaultDomain ?? '';
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProtectedAppForm>();

  const api = useApi();

  const onSubmit = handleSubmit(
    trySubmitSafe(async (data) => {
      if (isSubmitting) {
        return;
      }

      const createdApp = await api
        .post('api/applications', {
          json: {
            // App name is subdomain on create, but user can change it later in app details.
            name: data.subDomain,
            type: ApplicationType.Protected,
            protectedAppMetadata: data,
          },
        })
        .json<Application>();
      toast.success(t('applications.application_created'));
      onCreateSuccess?.(createdApp);
    })
  );

  return (
    <form className={className}>
      <div className={styles.formFieldWrapper}>
        {hasDetailedInstructions && (
          <div className={styles.withDashedLine}>
            <div className={styles.index}>1</div>
            <div className={styles.dashedLine} />
          </div>
        )}
        <FormField
          isRequired={hasRequiredLabel}
          className={styles.field}
          title="protected_app.form.domain_field_label"
          description={`protected_app.form.domain_field_description${
            hasDetailedInstructions ? '' : '_short'
          }`}
          tip={conditional(
            !hasDetailedInstructions && t('protected_app.form.domain_field_tooltip')
          )}
        >
          <div className={styles.domainFieldWrapper}>
            <TextInput
              className={styles.subdomain}
              {...register('subDomain', { required: true })}
              placeholder={t('protected_app.form.domain_field_placeholder')}
              error={Boolean(errors.subDomain)}
            />
            {defaultDomain && <div className={styles.domain}>{defaultDomain}</div>}
          </div>
        </FormField>
      </div>
      <div className={styles.formFieldWrapper}>
        {hasDetailedInstructions && <div className={styles.index}>2</div>}
        <FormField
          isRequired={hasRequiredLabel}
          className={styles.field}
          title="protected_app.form.url_field_label"
          description={conditional(
            hasDetailedInstructions && 'protected_app.form.url_field_description'
          )}
          tip={conditional(!hasDetailedInstructions && t('protected_app.form.url_field_tooltip'))}
        >
          <TextInput
            {...register('origin', { required: true })}
            placeholder={t('protected_app.form.url_field_placeholder')}
            error={Boolean(errors.origin)}
          />
        </FormField>
      </div>
      <Button
        className={classNames(
          styles.submitButton,
          buttonAlignment === 'left' && styles.leftAligned
        )}
        size={buttonSize}
        type="primary"
        title={buttonText}
        isLoading={isSubmitting}
        onClick={onSubmit}
      />
    </form>
  );
}

export default ProtectedAppForm;
