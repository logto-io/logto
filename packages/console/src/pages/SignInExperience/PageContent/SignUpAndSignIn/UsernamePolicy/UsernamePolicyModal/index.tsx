import { type UsernamePolicy } from '@logto/core-kit';
import { type SignInExperience } from '@logto/schemas';
import { type ChangeEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useSWRConfig } from 'swr';

import Button from '@/ds-components/Button';
import Checkbox from '@/ds-components/Checkbox';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import ModalLayout from '@/ds-components/ModalLayout';
import Switch from '@/ds-components/Switch';
import NumericInput from '@/ds-components/TextInput/NumericInput';
import useApi from '@/hooks/use-api';
import modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

import useConflictDetection from '../use-conflict-detection';

import styles from './index.module.scss';

// Inclusive length bounds enforced by the server's `usernamePolicyGuard`.
const lengthLimit = Object.freeze({ min: 1, max: 128 });

const allowedCharOptions = Object.freeze([
  'uppercase',
  'lowercase',
  'numbers',
  'underscore',
] as const);

type Props = {
  readonly policy: UsernamePolicy;
  readonly onClose: () => void;
};

function UsernamePolicyModal({ policy, onClose }: Props) {
  const api = useApi();
  const { mutate: mutateGlobal } = useSWRConfig();

  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.sign_in_exp.sign_up_and_sign_in.username_policy',
  });
  const { t: globalT } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const {
    control,
    handleSubmit,
    watch,
    formState: { isDirty, isSubmitting },
  } = useForm<UsernamePolicy>({ defaultValues: policy });

  const { allowedChars, minLength, maxLength, caseSensitive } = watch();

  // Numbers alone can't form a valid username; mirrors the `usernamePolicyGuard` refine.
  const hasNoValidLeadingChar =
    !allowedChars.uppercase && !allowedChars.lowercase && !allowedChars.underscore;
  // The empty selection deserves its own copy: "numbers alone" wording is wrong when nothing is on.
  const hasNoCharSelected = hasNoValidLeadingChar && !allowedChars.numbers;
  // A length input can momentarily hold an empty string while editing, so validate defensively
  // (`Number.isInteger` is false for '' / NaN) rather than relying on a bare `min > max` compare.
  const isMinGreaterThanMax =
    Number.isInteger(minLength) && Number.isInteger(maxLength) && minLength > maxLength;
  const isLengthValid =
    Number.isInteger(minLength) &&
    Number.isInteger(maxLength) &&
    minLength >= lengthLimit.min &&
    maxLength <= lengthLimit.max &&
    minLength <= maxLength;

  // Conflicts can only accumulate while case-sensitive, so only probe when switching it off.
  const { conflicts, isChecking: isCheckingConflicts } = useConflictDetection(
    policy.caseSensitive && !caseSensitive
  );
  const hasConflicts = Boolean(conflicts && conflicts.totalConflicts > 0);

  // `isCheckingConflicts` intentionally does not disable Save: keeping the button active avoids a
  // flicker when the operator toggles case sensitivity on an already-dirty form. The save click
  // handler below swallows clicks while the probe is in flight instead.
  const isSaveDisabled =
    !isDirty || hasNoValidLeadingChar || !isLengthValid || hasConflicts || isSubmitting;

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      // The PATCH returns the full updated SIE; seed the SWR cache with it (no revalidation) so the
      // entry card reflects the new policy immediately and we avoid a redundant GET.
      const updated = await api
        .patch('api/sign-in-exp', { json: { usernamePolicy: formData } })
        .json<SignInExperience>();
      await mutateGlobal('api/sign-in-exp', updated, false);
      toast.success(globalT('general.saved'));
      onClose();
    })
  );

  const onSaveClick = () => {
    // Gate before react-hook-form so an ignored click can't flash `isSubmitting`.
    if (isCheckingConflicts) {
      return;
    }

    void onSubmit();
  };

  return (
    <ReactModal
      shouldCloseOnEsc
      isOpen
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onClose}
    >
      <ModalLayout
        title="sign_in_exp.sign_up_and_sign_in.username_policy.modal_title"
        subtitle="sign_in_exp.sign_up_and_sign_in.username_policy.modal_description"
        size="large"
        footer={
          <Button
            type="primary"
            title="general.save_changes"
            htmlType="submit"
            disabled={isSaveDisabled}
            isLoading={isSubmitting}
            onClick={onSaveClick}
          />
        }
        onClose={onClose}
      >
        <form>
          <FormField title="sign_in_exp.sign_up_and_sign_in.username_policy.length.title">
            <div className={styles.lengthFields}>
              <div className={styles.lengthField}>
                <span className={styles.lengthLabel}>{t('length.minimum')}</span>
                <Controller
                  name="minLength"
                  control={control}
                  rules={{ min: lengthLimit.min, max: lengthLimit.max }}
                  render={({ field: { onChange, value, name } }) => (
                    <NumericInput
                      name={name}
                      value={String(value)}
                      min={lengthLimit.min}
                      max={lengthLimit.max}
                      error={isMinGreaterThanMax && t('length.min_greater_than_max')}
                      onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
                        onChange(value && Number(value));
                      }}
                      onValueUp={() => {
                        onChange(Math.min(lengthLimit.max, Number(value) + 1));
                      }}
                      onValueDown={() => {
                        onChange(Math.max(lengthLimit.min, Number(value) - 1));
                      }}
                      onBlur={() => {
                        if (value < lengthLimit.min) {
                          onChange(lengthLimit.min);
                        } else if (value > lengthLimit.max) {
                          onChange(lengthLimit.max);
                        }
                      }}
                    />
                  )}
                />
              </div>
              <div className={styles.separatorColumn}>
                {/* Empty label keeps the dash on the same baseline as the inputs below the labels. */}
                <span aria-hidden className={styles.lengthLabel}>
                  &nbsp;
                </span>
                <span className={styles.separator}>–</span>
              </div>
              <div className={styles.lengthField}>
                <span className={styles.lengthLabel}>{t('length.maximum')}</span>
                <Controller
                  name="maxLength"
                  control={control}
                  rules={{ min: lengthLimit.min, max: lengthLimit.max }}
                  render={({ field: { onChange, value, name } }) => (
                    <NumericInput
                      name={name}
                      value={String(value)}
                      min={lengthLimit.min}
                      max={lengthLimit.max}
                      onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
                        onChange(value && Number(value));
                      }}
                      onValueUp={() => {
                        onChange(Math.min(lengthLimit.max, Number(value) + 1));
                      }}
                      onValueDown={() => {
                        onChange(Math.max(lengthLimit.min, Number(value) - 1));
                      }}
                      onBlur={() => {
                        if (value < lengthLimit.min) {
                          onChange(lengthLimit.min);
                        } else if (value > lengthLimit.max) {
                          onChange(lengthLimit.max);
                        }
                      }}
                    />
                  )}
                />
              </div>
            </div>
          </FormField>
          <FormField title="sign_in_exp.sign_up_and_sign_in.username_policy.allowed_chars.title">
            <div className={styles.allowedChars}>
              {allowedCharOptions.map((charType) => (
                <Controller
                  key={charType}
                  name={`allowedChars.${charType}`}
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Checkbox
                      checked={value}
                      label={t(`allowed_chars.${charType}`)}
                      onChange={onChange}
                    />
                  )}
                />
              ))}
            </div>
            {hasNoValidLeadingChar && (
              <div className={styles.error}>
                {hasNoCharSelected
                  ? t('allowed_chars.no_char_selected')
                  : t('allowed_chars.no_valid_leading_char')}
              </div>
            )}
          </FormField>
          <FormField title="sign_in_exp.sign_up_and_sign_in.username_policy.case_sensitive.title">
            <Controller
              name="caseSensitive"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Switch
                  checked={value}
                  description="sign_in_exp.sign_up_and_sign_in.username_policy.case_sensitive.description"
                  onChange={({ target: { checked } }: ChangeEvent<HTMLInputElement>) => {
                    onChange(checked);
                  }}
                />
              )}
            />
            {hasConflicts && conflicts && (
              <InlineNotification severity="alert" className={styles.conflicts}>
                <div className={styles.conflictsTitle}>{t('case_conflicts.title')}</div>
                <div>{t('case_conflicts.description', { count: conflicts.totalConflicts })}</div>
                <div className={styles.conflictsSampleTitle}>
                  {t('case_conflicts.sample_title')}
                </div>
                <ul className={styles.conflictsSamples}>
                  {conflicts.samples.map(({ usernameLower }) => (
                    <li key={usernameLower}>{usernameLower}</li>
                  ))}
                </ul>
              </InlineNotification>
            )}
          </FormField>
        </form>
      </ModalLayout>
    </ReactModal>
  );
}

export default UsernamePolicyModal;
