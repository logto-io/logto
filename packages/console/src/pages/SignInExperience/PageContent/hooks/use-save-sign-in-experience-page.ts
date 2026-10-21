import type { AccountCenter as AccountCenterConfig, SignInExperience } from '@logto/schemas';
import { useCallback, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { isDevFeaturesEnabled } from '@/consts/env';
import useApi from '@/hooks/use-api';
import useConfigs from '@/hooks/use-configs';

import {
  convertAccountCenterToForm,
  normalizeAccountCenterFieldsForSubmit,
  normalizeDeleteAccountUrl,
  normalizeWebauthnRelatedOrigins,
  type SignInExperiencePageForm,
} from '../../types';
import { sieFormDataParser } from '../utils/parser';

type Props = {
  readonly data: SignInExperience & { accountCenter: AccountCenterConfig };
  readonly methods: UseFormReturn<SignInExperiencePageForm>;
  readonly isHideLogtoBrandingAvailable: boolean;
  readonly isCustomUiCspEnabled: boolean;
  readonly onSignInExperienceUpdated: (data: SignInExperience) => void;
  readonly onAccountCenterUpdated: (data: AccountCenterConfig) => void;
  /** Resets page-level state that depends on the save, e.g. the change confirmation modal. */
  readonly onSaved: () => void;
};

/**
 * Persists the whole sign-in experience page: the sign-in experience, the Account Center config,
 * and the recent-authentication window, which is a tenant config and is only written when the
 * Account Center tab changed it.
 */
export const useSaveSignInExperiencePage = ({
  data,
  methods,
  isHideLogtoBrandingAvailable,
  isCustomUiCspEnabled,
  onSignInExperienceUpdated,
  onAccountCenterUpdated,
  onSaved,
}: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const { updateConfigs } = useConfigs();
  const [isSaving, setIsSaving] = useState(false);

  const saveData = useCallback(async () => {
    setIsSaving(true);

    try {
      const { accountCenter, ...formValues } = methods.getValues();
      const webauthnRelatedOrigins = normalizeWebauthnRelatedOrigins(
        accountCenter.webauthnRelatedOrigins
      );
      const deleteAccountUrl = normalizeDeleteAccountUrl(accountCenter.deleteAccountUrl);
      const fields = accountCenter.enabled
        ? normalizeAccountCenterFieldsForSubmit(accountCenter.fields, data.accountCenter.fields)
        : {};
      const isMaximumAuthenticationAgeDirty = methods.getFieldState(
        'accountCenter.maximumAuthenticationAgeInMinutes'
      ).isDirty;

      const updatedData = await api
        .patch('api/sign-in-exp', {
          json: sieFormDataParser.toSignInExperience(formValues, {
            isHideLogtoBrandingAvailable,
            isCustomUiCspEnabled,
          }),
        })
        .json<SignInExperience>();

      const updatedAccountCenter = await api
        .patch('api/account-center', {
          json: {
            enabled: accountCenter.enabled,
            // Disable all fields when account center is disabled
            fields,
            webauthnRelatedOrigins,
            deleteAccountUrl,
            customCss: accountCenter.customCss?.length ? accountCenter.customCss : null,
            profileFields: accountCenter.profileFields,
            ...(isDevFeaturesEnabled &&
              isMaximumAuthenticationAgeDirty && {
                maximumAuthenticationAgeInSeconds: Math.floor(
                  accountCenter.maximumAuthenticationAgeInMinutes * 60
                ),
              }),
          },
        })
        .json<AccountCenterConfig>();

      onAccountCenterUpdated(updatedAccountCenter);
      methods.reset({
        ...sieFormDataParser.fromSignInExperience(updatedData),
        accountCenter: convertAccountCenterToForm(updatedAccountCenter),
      });

      onSignInExperienceUpdated(updatedData);
      onSaved();
      await updateConfigs({ signInExperienceCustomized: true });
      toast.success(t('general.saved'));
    } finally {
      setIsSaving(false);
    }
  }, [
    api,
    data.accountCenter.fields,
    isCustomUiCspEnabled,
    isHideLogtoBrandingAvailable,
    methods,
    onAccountCenterUpdated,
    onSaved,
    onSignInExperienceUpdated,
    t,
    updateConfigs,
  ]);

  return { isSaving, saveData };
};
