import { Theme } from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import ColorPicker from '@/ds-components/ColorPicker';
import FormField from '@/ds-components/FormField';
import ImageUploader from '@/ds-components/Uploader/ImageUploader';

import * as styles from './index.module.scss';
import { type FormData } from './utils';

type Props = {
  readonly form: UseFormReturn<FormData>;
};

function Branding({ form }: Props) {
  const {
    control,
    formState: { errors },
    setError,
    clearErrors,
    watch,
  } = form;
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <FormCard
      title="organization_details.branding.title"
      description="organization_details.branding.description"
    >
      <div className={styles.branding}>
        {Object.values(Theme).map((theme) => (
          <section key={theme}>
            <FormField title={`organization_details.branding.${theme}.primary_color`}>
              <Controller
                name="branding.light.primaryColor"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <ColorPicker value={value} onChange={onChange} />
                )}
              />
            </FormField>
            <FormField title={`organization_details.branding.${theme}.logo`}>
              <Controller
                control={control}
                name="branding.light.logoUrl"
                render={({ field: { onChange, value, name } }) => (
                  <ImageUploader
                    name={name}
                    value={value ?? ''}
                    actionDescription={t('organization_details.branding.logo_upload_description')}
                    onCompleted={onChange}
                    // OnUploadErrorChange={setUploadLogoError}
                    onUploadErrorChange={noop}
                    onDelete={() => {
                      onChange('');
                    }}
                  />
                )}
              />
            </FormField>
          </section>
        ))}
      </div>
    </FormCard>
  );
}

export default Branding;
