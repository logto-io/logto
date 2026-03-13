import { type OidcSessionConfig, oidcSessionConfigGuard } from '@logto/schemas';
import { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import useApi, { type RequestError } from '@/hooks/use-api';
import { trySubmitSafe } from '@/utils/form';

type SessionConfigResponse = OidcSessionConfig & {
  ttl: number;
};

export type SessionConfigFormData = {
  ttlInDays?: number;
  /**
   * Keep the original value in seconds from the backend so we can avoid
   * accidental precision loss when the value is not day-aligned.
   */
  originalTtlInSeconds: number;
};

const secondsPerDay = 24 * 60 * 60;
const { minValue, maxValue } = oidcSessionConfigGuard.shape.ttl._def.innerType;

export const minSessionTtlInDays = Math.ceil((minValue ?? 1) / secondsPerDay);
export const maxSessionTtlInDays = Math.floor(
  (maxValue ?? Number.MAX_SAFE_INTEGER) / secondsPerDay
);

const sessionConfigFormDataParser = Object.freeze({
  fromSessionResponse: ({ ttl }: SessionConfigResponse): SessionConfigFormData => ({
    ttlInDays: Math.floor(ttl / secondsPerDay),
    originalTtlInSeconds: ttl,
  }),
  toSessionRequestPayload: (
    formData: SessionConfigFormData,
    isTtlFieldDirty: boolean
  ): SessionConfigResponse => ({
    ttl: isTtlFieldDirty
      ? Math.floor((formData.ttlInDays ?? 0) * secondsPerDay)
      : // Preserve the exact original seconds value when the day field has
        // not been edited. This prevents silent truncation of non-day TTLs.
        formData.originalTtlInSeconds,
  }),
});

const useSessionConfigForm = (
  formMethods: UseFormReturn<{
    session: SessionConfigFormData;
  }>
) => {
  const api = useApi();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, mutate } = useSWR<SessionConfigResponse, RequestError>(
    'api/configs/oidc/session'
  );

  const { resetField, handleSubmit, formState } = formMethods;

  useEffect(() => {
    if (data) {
      // Do not overwrite in-progress edits during SWR revalidation.
      if (formState.isDirty) {
        return;
      }

      resetField('session', {
        defaultValue: sessionConfigFormDataParser.fromSessionResponse(data),
      });
    }
  }, [data, formState.isDirty, resetField]);

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      if (formState.isSubmitting) {
        return;
      }

      const updatedData = await api
        .patch('api/configs/oidc/session', {
          json: sessionConfigFormDataParser.toSessionRequestPayload(
            formData.session,
            Boolean(formState.dirtyFields.session?.ttlInDays)
          ),
        })
        .json<SessionConfigResponse>();

      resetField('session', {
        defaultValue: sessionConfigFormDataParser.fromSessionResponse(updatedData),
      });
      void mutate(updatedData);
      toast.success(t('general.saved'));
    })
  );

  return {
    errorMessage: error?.body?.message ?? error?.message,
    onSubmit,
  };
};

export default useSessionConfigForm;
