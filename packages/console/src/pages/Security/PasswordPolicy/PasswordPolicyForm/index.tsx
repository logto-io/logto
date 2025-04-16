import { PasswordPolicyChecker } from '@logto/core-kit';
import { type SignInExperience } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import { type ChangeEvent } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { passwordPolicy } from '@/consts';
import FormField from '@/ds-components/FormField';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import NumericInput from '@/ds-components/TextInput/NumericInput';
import TextLink from '@/ds-components/TextLink';
import Textarea from '@/ds-components/Textarea';
import useApi from '@/hooks/use-api';
import { trySubmitSafe } from '@/utils/form';

import PasswordOption from '../PasswordOption';
import { passwordPolicyFormParser, type PasswordPolicyFormData } from '../use-password-policy';

import styles from './index.module.scss';

type Props = {
  readonly data: PasswordPolicyFormData;
};

function PasswordPolicyForm({ data }: Props) {
  const api = useApi();
  const { mutate: mutateGlobal } = useSWRConfig();

  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.security.password_policy',
  });

  const { t: globalT } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });

  const formMethods = useForm<PasswordPolicyFormData>({
    defaultValues: data,
  });

  const {
    control,
    register,
    reset,
    handleSubmit,
    getValues,
    formState: { isDirty, isSubmitting, errors },
  } = formMethods;

  const max = getValues('length.max');

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData: PasswordPolicyFormData) => {
      if (isSubmitting) {
        return;
      }

      const updatedData = await api
        .patch('api/sign-in-exp', {
          json: passwordPolicyFormParser.toSignInExperience(formData),
        })
        .json<SignInExperience>();

      // Reset the form with the updated data
      reset(passwordPolicyFormParser.fromSignInExperience(updatedData));

      // Global mutate the SIE data
      await mutateGlobal('api/sign-in-exp');

      toast.success(globalT('general.saved'));
    })
  );

  return (
    <>
      <FormProvider {...formMethods}>
        <DetailsForm
          isDirty={isDirty}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onDiscard={reset}
        >
          <FormCard
            title="security.password_policy.password_requirements"
            description="security.password_policy.password_requirements_description"
            learnMoreLink={{
              href: passwordPolicy,
            }}
          >
            <FormField title="security.password_policy.minimum_length">
              <div className={styles.formFieldDescription}>
                <Trans
                  components={{
                    a: (
                      <TextLink
                        targetBlank
                        href="https://pages.nist.gov/800-63-3/sp800-63b.html#sec5"
                      />
                    ),
                  }}
                >
                  {t('minimum_length_description')}
                </Trans>
              </div>
              <Controller
                name="length.min"
                control={control}
                rules={{
                  min: 1,
                  max,
                }}
                render={({ field: { onChange, value, name } }) => (
                  <NumericInput
                    className={styles.minLength}
                    name={name}
                    value={String(value)}
                    min={1}
                    max={max}
                    error={errors.length?.min && t('minimum_length_error', { min: 1, max })}
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
                      } else if (value > max) {
                        onChange(max);
                      }
                    }}
                  />
                )}
              />
            </FormField>
            <FormField title="security.password_policy.minimum_required_char_types">
              <div className={styles.formFieldDescription}>
                {t('minimum_required_char_types_description', {
                  symbols: PasswordPolicyChecker.symbols,
                })}
              </div>
              <Controller
                name="characterTypes.min"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <RadioGroup
                    name={name}
                    className={styles.characterTypes}
                    value={cond(value && String(value))}
                    onChange={(value) => {
                      onChange(Number(value));
                    }}
                  >
                    {[1, 2, 3, 4].map((i) => (
                      <Radio key={i} title={<span>{i}</span>} value={String(i)} />
                    ))}
                  </RadioGroup>
                )}
              />
            </FormField>
          </FormCard>
          <FormCard title="security.password_policy.password_rejection">
            <FormField title="security.password_policy.compromised_passwords">
              <PasswordOption
                name="rejects.pwned"
                title={t('breached_passwords')}
                description={t('breached_passwords_description')}
              />
            </FormField>
            <FormField
              title="security.password_policy.restricted_phrases"
              tip={t('restricted_phrases_tooltip')}
            >
              <PasswordOption
                name="rejects.repetitionAndSequence"
                title={t('repetitive_or_sequential_characters')}
                description={t('repetitive_or_sequential_characters_description')}
              />
              <PasswordOption
                name="rejects.userInfo"
                title={t('user_information')}
                description={t('user_information_description')}
              />
              <PasswordOption
                name="isCustomWordsEnabled"
                title={t('custom_words')}
                description={t('custom_words_description')}
              />
              {getValues('isCustomWordsEnabled') && (
                <Textarea
                  className={styles.textarea}
                  rows={5}
                  placeholder={t('custom_words_placeholder')}
                  {...register('customWords')}
                />
              )}
            </FormField>
          </FormCard>
        </DetailsForm>
      </FormProvider>
      <UnsavedChangesAlertModal hasUnsavedChanges={isDirty} />
    </>
  );
}

export default PasswordPolicyForm;
