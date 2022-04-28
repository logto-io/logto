import React, { useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import DangerousRaw from '@/components/DangerousRaw';
import FormField from '@/components/FormField';
import MultiTextInput from '@/components/MultiTextInput';
import { createValidatorForRhf, convertRhfErrorMessage } from '@/components/MultiTextInput/utils';
import { GuideForm } from '@/types/guide';
import { noSpaceRegex } from '@/utilities/regex';

type Props = {
  name: 'redirectUris' | 'postLogoutRedirectUris';
  title: string;
  onError?: () => void;
};

const MultiTextInputField = ({ name, title, onError }: Props) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<GuideForm>();

  const ref = useRef<HTMLDivElement>(null);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const firstErrorKey = Object.keys(errors)[0];
  const isFirstErrorField = firstErrorKey && firstErrorKey === name;

  if (isFirstErrorField) {
    ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    onError?.();
  }

  return (
    <FormField isRequired title={<DangerousRaw>{title}</DangerousRaw>}>
      <Controller
        name={name}
        control={control}
        defaultValue={[]}
        rules={{
          validate: createValidatorForRhf({
            required: t('errors.required_field_missing_plural', { field: title }),
            pattern: {
              regex: noSpaceRegex,
              message: t('errors.no_space_in_uri'),
            },
          }),
        }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <div ref={ref}>
            <MultiTextInput
              value={value}
              error={convertRhfErrorMessage(error?.message)}
              onChange={onChange}
            />
          </div>
        )}
      />
    </FormField>
  );
};

export default MultiTextInputField;
