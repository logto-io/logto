import { Theme, themeToLogoKey } from '@logto/schemas';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormCard, { FormCardSkeleton } from '@/components/FormCard';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';
import ImageUploaderField from '@/ds-components/Uploader/ImageUploaderField';
import useUserAssetsService from '@/hooks/use-user-assets-service';
import { uriValidator } from '@/utils/validator';

import * as styles from './index.module.scss';
import { type FormData } from './utils';

type Props = {
  readonly form: UseFormReturn<FormData>;
};

function Branding({ form }: Props) {
  const { isReady: isUserAssetsServiceReady, isLoading } = useUserAssetsService();
  const {
    control,
    formState: { errors },
    register,
  } = form;
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  if (isLoading) {
    return <FormCardSkeleton />;
  }

  return (
    <FormCard
      title="organization_details.branding.title"
      description="organization_details.branding.description"
    >
      <div className={styles.branding}>
        {Object.values(Theme).map((theme) => (
          <section key={theme}>
            <FormField title={`organization_details.branding.${theme}_logo`}>
              {isUserAssetsServiceReady ? (
                <Controller
                  control={control}
                  name={`branding.${themeToLogoKey[theme]}`}
                  render={({ field: { onChange, value, name } }) => (
                    <ImageUploaderField
                      name={name}
                      value={value ?? ''}
                      actionDescription={t('organization_details.branding.logo_upload_description')}
                      onChange={onChange}
                    />
                  )}
                />
              ) : (
                <TextInput
                  {...register(`branding.${themeToLogoKey[theme]}`, {
                    validate: (value?: string) =>
                      !value || uriValidator(value) || t('errors.invalid_uri_format'),
                  })}
                  error={errors.branding?.[themeToLogoKey[theme]]?.message}
                  placeholder={t('sign_in_exp.branding.logo_image_url_placeholder')}
                />
              )}
            </FormField>
          </section>
        ))}
      </div>
    </FormCard>
  );
}

export default Branding;
