import { type LocalePhrase } from '@logto/phrases';
import { Theme } from '@logto/schemas';
import { cond, noop } from '@silverhand/essentials';
import classNames from 'classnames';
import type React from 'react';
import { useMemo, useState } from 'react';
import {
  Controller,
  type FieldPath,
  type FieldValues,
  type Control,
  type UseFormRegister,
  type FieldError,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/ds-components/FormField';
import Skeleton from '@/ds-components/FormField/Skeleton';
import TextInput from '@/ds-components/TextInput';
import ImageUploader from '@/ds-components/Uploader/ImageUploader';
import useImageMimeTypes from '@/hooks/use-image-mime-types';
import useUserAssetsService from '@/hooks/use-user-assets-service';
import { uriValidator } from '@/utils/validator';

import styles from './index.module.scss';

export const themeToLogoName = Object.freeze({
  [Theme.Light]: 'logoUrl',
  [Theme.Dark]: 'darkLogoUrl',
} as const satisfies Record<Theme, string>);

export type ImageField<FormContext extends FieldValues> = {
  /** The name (field path) of the field in the form. */
  name: FieldPath<FormContext>;
  /**
   * The type of the field. It should match the existing structure in the translation file to get
   * the correct translations.
   */
  type: keyof LocalePhrase['translation']['admin_console']['sign_in_exp']['branding_uploads'];
  theme: Theme;
  /** The error message of the field in the form. */
  error?: FieldError;
};

type Props<FormContext extends FieldValues> = {
  /** The condensed title when user assets service is available. */
  readonly uploadTitle: React.ComponentProps<typeof FormField>['title'];
  /**
   * When user assets service is available, the tip will be displayed for the `uploadTitle`;
   * otherwise, it will be displayed for each text input.
   */
  readonly tip?: React.ComponentProps<typeof FormField>['tip'];
  readonly control: Control<FormContext>;
  readonly register: UseFormRegister<FormContext>;
  readonly fields: Array<ImageField<FormContext>>;
};

/**
 * A component that renders the logo inputs for a form.
 *
 * When user assets service is available, it will render the image uploader components side-by-side;
 * otherwise, it will render the text inputs.
 */
function ImageInputs<FormContext extends FieldValues>({
  uploadTitle,
  tip,
  control,
  register,
  fields,
}: Props<FormContext>) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [uploadErrors, setUploadErrors] = useState<Partial<Record<string, string>>>({});
  const { description } = useImageMimeTypes();
  const { isReady: isUserAssetsServiceReady, isLoading } = useUserAssetsService();
  const uploadErrorChangeHandlers = useMemo(
    () =>
      Object.fromEntries(
        fields.map((field) => [
          field.name,
          (message?: string) => {
            setUploadErrors((previous) => ({ ...previous, [field.name]: message }));
          },
        ])
      ),
    [fields]
  );

  if (isLoading) {
    return <Skeleton formFieldCount={2} />;
  }

  if (!isUserAssetsServiceReady) {
    return (
      <>
        {fields.map((field) => (
          <FormField
            key={field.name}
            tip={tip}
            title={
              <>
                {t(`sign_in_exp.branding.with_${field.theme}`, {
                  value: t(`sign_in_exp.branding_uploads.${field.type}.url`),
                })}
              </>
            }
          >
            <TextInput
              key={field.name}
              {...register(field.name, {
                validate: (value) =>
                  !value || uriValidator(value) || t('errors.invalid_uri_format'),
                shouldUnregister: true,
              })}
              placeholder={t(`sign_in_exp.branding_uploads.${field.type}.url_placeholder`)}
              error={field.error?.message}
            />
          </FormField>
        ))}
      </>
    );
  }

  return (
    <FormField title={uploadTitle} tip={tip}>
      <div className={styles.container}>
        {fields.map((field) => (
          <Controller
            key={field.name}
            name={field.name}
            control={control}
            render={({ field: { onChange, value, name } }) => (
              <ImageUploader
                className={cond(field.type.endsWith('_logo') && styles.logo)}
                uploadedClassName={styles[field.theme]}
                name={name}
                value={value ?? ''}
                actionDescription={t(`sign_in_exp.branding.with_${field.theme}`, {
                  value: t(`sign_in_exp.branding_uploads.${field.type}.title`),
                })}
                onUploadComplete={({ url }) => {
                  onChange(url);
                }}
                // Noop fallback should not be necessary, but for TypeScript to be happy
                onUploadErrorChange={uploadErrorChangeHandlers[field.name] ?? noop}
                onDelete={() => {
                  onChange('');
                }}
              />
            )}
          />
        ))}
      </div>
      {fields.map(
        (field) =>
          uploadErrors[field.name] && (
            <div key={field.name} className={classNames(styles.description, styles.error)}>
              {t(`sign_in_exp.branding_uploads.${field.type}.error`, {
                error: uploadErrors[field.name],
              })}
            </div>
          )
      )}

      <div className={styles.description}>{description}</div>
    </FormField>
  );
}

export default ImageInputs;
