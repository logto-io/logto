import { type Theme } from '@logto/schemas';
import { type FieldValues, type Control, type UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import ImageInputs, { type ImageField } from '.';

type Field<FormContext extends FieldValues> = Pick<ImageField<FormContext>, 'name' | 'error'>;

type Props<FormContext extends FieldValues> = {
  readonly theme: Theme;
  readonly control: Control<FormContext>;
  readonly register: UseFormRegister<FormContext>;
  /**
   * Form-related data of the logo input, including the name (field path) and error in the form.
   */
  readonly logo: Field<FormContext>;
  /**
   * Form-related data of the favicon input, including the name (field path) and error in the form.
   */
  readonly favicon: Field<FormContext>;
  /** The type of the logo. It will affect the translation key. */
  readonly type: 'app_logo' | 'company_logo';
};

/**
 * A component that renders the logo and favicon inputs for a form.
 *
 * When user assets service is available, it will render two image uploader components side-by-side;
 * otherwise, it will render two text inputs.
 *
 * @see {@link ImageInputs} for the implementation of the inner components.
 */
function LogoAndFavicon<FormContext extends FieldValues>({
  theme,
  control,
  register,
  logo,
  favicon,
  type,
}: Props<FormContext>) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <ImageInputs
      uploadTitle={
        <>
          {t(`sign_in_exp.branding.with_${theme}`, {
            value: t(`sign_in_exp.branding.${type}_and_favicon`),
          })}
        </>
      }
      control={control}
      register={register}
      fields={[
        { ...logo, theme, type },
        { ...favicon, theme, type: 'favicon' },
      ]}
    />
  );
}

export default LogoAndFavicon;
