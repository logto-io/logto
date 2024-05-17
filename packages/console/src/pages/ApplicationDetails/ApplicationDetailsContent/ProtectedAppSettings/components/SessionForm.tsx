import { type Application, type SnakeCaseOidcConfig } from '@logto/schemas';
import { type ChangeEvent } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import useSWRImmutable from 'swr/immutable';

import FormCard from '@/components/FormCard';
import { openIdProviderConfigPath } from '@/consts/oidc';
import FormField from '@/ds-components/FormField';
import NumericInput from '@/ds-components/TextInput/NumericInput';
import { type RequestError } from '@/hooks/use-api';

import { type ApplicationForm } from '../../utils';

import * as styles from './SessionForm.module.scss';

type Props = {
  readonly data: Application;
};

const maxSessionDuration = 365; // 1 year

function SessionForm({ data }: Props) {
  const { data: oidcConfig } = useSWRImmutable<SnakeCaseOidcConfig, RequestError>(
    openIdProviderConfigPath
  );

  const {
    control,
    formState: { errors },
  } = useFormContext<ApplicationForm>();

  if (!data.protectedAppMetadata || !oidcConfig) {
    return null;
  }

  return (
    <FormCard title="application_details.session">
      <FormField title="application_details.session_duration">
        <Controller
          name="protectedAppMetadata.sessionDuration"
          control={control}
          rules={{
            min: 1,
          }}
          render={({ field: { onChange, value, name } }) => (
            <NumericInput
              className={styles.sessionDuration}
              name={name}
              placeholder="14"
              value={String(value)}
              min={1}
              max={maxSessionDuration}
              error={Boolean(errors.protectedAppMetadata?.sessionDuration)}
              onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
                onChange(value && Number(value));
              }}
              onValueUp={() => {
                onChange(value + 1);
              }}
              onValueDown={() => {
                onChange(value - 1);
              }}
              onBlur={() => {
                if (value < 1) {
                  onChange(1);
                } else if (value > maxSessionDuration) {
                  onChange(maxSessionDuration);
                }
              }}
            />
          )}
        />
      </FormField>
    </FormCard>
  );
}

export default SessionForm;
