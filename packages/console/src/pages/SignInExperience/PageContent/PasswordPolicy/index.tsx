import { PasswordPolicyChecker } from '@logto/core-kit';
import { cond } from '@silverhand/essentials';
import { type ChangeEvent, type ReactNode } from 'react';
import { Controller, type FieldPath, useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import PageMeta from '@/components/PageMeta';
import Card from '@/ds-components/Card';
import Checkbox from '@/ds-components/Checkbox/Checkbox';
import FormField from '@/ds-components/FormField';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import NumericInput from '@/ds-components/TextInput/NumericInput';
import TextLink from '@/ds-components/TextLink';
import Textarea from '@/ds-components/Textarea';

import { type SignInExperienceForm } from '../../types';
import FormFieldDescription from '../components/FormFieldDescription';
import FormSectionTitle from '../components/FormSectionTitle';
import SignInExperienceTabWrapper from '../components/SignInExperienceTabWrapper';

import * as styles from './index.module.scss';

type PasswordOptionProps = {
  readonly name: FieldPath<SignInExperienceForm>;
  readonly title: string;
  readonly description: string;
  readonly children?: ReactNode;
};

/** A display component for password policy options with a title and description. */
function PasswordOption({ name, title, description, children }: PasswordOptionProps) {
  const { control } = useFormContext<SignInExperienceForm>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <Checkbox
          className={styles.passwordOption}
          label={
            <div className={styles.label}>
              <div className={styles.title}>{title}</div>
              <div className={styles.description}>{description}</div>
              {children}
            </div>
          }
          checked={Boolean(value)}
          onChange={onChange}
        />
      )}
    />
  );
}

type Props = {
  readonly isActive: boolean;
};

function PasswordPolicy({ isActive }: Props) {
  const {
    control,
    register,
    getValues,
    formState: { errors },
  } = useFormContext<SignInExperienceForm>();
  const max = getValues('passwordPolicy.length.max');
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.sign_in_exp.password_policy',
  });

  return (
    <SignInExperienceTabWrapper isActive={isActive}>
      {isActive && (
        <PageMeta titleKey={['sign_in_exp.tabs.password_policy', 'sign_in_exp.page_title']} />
      )}
      <Card>
        <FormSectionTitle title="password_policy.password_requirements" />
        <FormField title="sign_in_exp.password_policy.minimum_length">
          <FormFieldDescription>
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
          </FormFieldDescription>
          <Controller
            name="passwordPolicy.length.min"
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
                error={
                  errors.passwordPolicy?.length?.min && t('minimum_length_error', { min: 1, max })
                }
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
        <FormField title="sign_in_exp.password_policy.minimum_required_char_types">
          <FormFieldDescription>
            {t('minimum_required_char_types_description', {
              symbols: PasswordPolicyChecker.symbols,
            })}
          </FormFieldDescription>
          <Controller
            name="passwordPolicy.characterTypes.min"
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
      </Card>
      <Card>
        <FormSectionTitle title="password_policy.password_rejection" />
        <FormField title="sign_in_exp.password_policy.compromised_passwords">
          <PasswordOption
            name="passwordPolicy.rejects.pwned"
            title={t('breached_passwords')}
            description={t('breached_passwords_description')}
          />
        </FormField>
        <FormField
          title="sign_in_exp.password_policy.restricted_phrases"
          tip={t('restricted_phrases_tooltip')}
        >
          <PasswordOption
            name="passwordPolicy.rejects.repetitionAndSequence"
            title={t('repetitive_or_sequential_characters')}
            description={t('repetitive_or_sequential_characters_description')}
          />
          <PasswordOption
            name="passwordPolicy.rejects.userInfo"
            title={t('user_information')}
            description={t('user_information_description')}
          />
          <PasswordOption
            name="passwordPolicy.isCustomWordsEnabled"
            title={t('custom_words')}
            description={t('custom_words_description')}
          />
          {getValues('passwordPolicy.isCustomWordsEnabled') && (
            <Textarea
              className={styles.textarea}
              rows={5}
              placeholder={t('custom_words_placeholder')}
              {...register('passwordPolicy.customWords')}
            />
          )}
        </FormField>
      </Card>
    </SignInExperienceTabWrapper>
  );
}

export default PasswordPolicy;
