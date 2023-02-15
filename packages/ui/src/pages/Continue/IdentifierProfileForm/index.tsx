import classNames from 'classnames';
import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import type { IdentifierInputType } from '@/components/InputFields';
import { SmartInputField } from '@/components/InputFields';
import { getGeneralIdentifierErrorMessage, validateIdentifierField } from '@/utils/form';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
  defaultType: IdentifierInputType;
  enabledTypes: IdentifierInputType[];

  onSubmit?: (identifier: IdentifierInputType, value: string) => Promise<void> | void;
  errorMessage?: string;
  clearErrorMessage?: () => void;
};

type FormState = {
  identifier: string;
};

const IdentifierProfileForm = ({
  className,
  autoFocus,
  defaultType,
  enabledTypes,
  onSubmit,
  errorMessage,
  clearErrorMessage,
}: Props) => {
  const { t } = useTranslation();
  const [inputType, setInputType] = useState<IdentifierInputType>(defaultType);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormState>({
    reValidateMode: 'onChange',
    defaultValues: { identifier: '' },
  });

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      clearErrorMessage?.();

      void handleSubmit(async ({ identifier }, event) => {
        event?.preventDefault();

        await onSubmit?.(inputType, identifier);
      })(event);
    },
    [clearErrorMessage, handleSubmit, inputType, onSubmit]
  );

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <Controller
        control={control}
        name="identifier"
        rules={{
          required: getGeneralIdentifierErrorMessage(enabledTypes, 'required'),
          validate: (value) => {
            const errorMessage = validateIdentifierField(inputType, value);

            if (errorMessage) {
              return typeof errorMessage === 'string'
                ? t(`error.${errorMessage}`)
                : t(`error.${errorMessage.code}`, errorMessage.data);
            }

            return true;
          },
        }}
        render={({ field }) => (
          <SmartInputField
            autoComplete="new-identifier"
            autoFocus={autoFocus}
            className={styles.inputField}
            {...field}
            currentType={inputType}
            isDanger={!!errors.identifier}
            errorMessage={errors.identifier?.message}
            enabledTypes={enabledTypes}
            onTypeChange={setInputType}
          />
        )}
      />

      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      <Button title="action.continue" htmlType="submit" />

      <input hidden type="submit" />
    </form>
  );
};

export default IdentifierProfileForm;
