import SelectField from '@experience/components/InputFields/SelectField';
import CloseIcon from '@experience/shared/assets/icons/nav-close.svg?react';
import Button from '@experience/shared/components/Button';
import InputField from '@experience/shared/components/InputFields/InputField';
import { CustomProfileFieldType, type JsonObject, type UserProfileResponse } from '@logto/schemas';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import { updateCustomData, updateName, updateProfile } from '@ac/apis/account';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';

import DateField from './EditProfileFieldModal/DateField';
import {
  buildEditableFields,
  getCustomDataValue,
  getDateFormat,
  getProfileValue,
  getValidationError,
  type EditableField,
  type EditableValue,
} from './EditProfileFieldModal/utils';
import styles from './EditProfileFieldModal.module.scss';
import { getSelectOptionLabel } from './select-options';
import type { ProfileFieldRow } from './types';

type Props = {
  readonly field?: ProfileFieldRow;
  readonly userInfo?: Partial<UserProfileResponse>;
  readonly onClose: () => void;
  readonly onUpdated: () => Promise<void>;
};

const getSelectOptions = (
  { config, required }: EditableField,
  emptyOptionLabel: string,
  translate: (key: string) => string
) => [
  ...(required ? [] : [{ value: '', label: emptyOptionLabel }]),
  ...(config?.options?.map(({ label, value }) => ({
    value,
    label: getSelectOptionLabel(value, label, translate),
  })) ?? []),
];

const EditProfileFieldModal = ({ field, userInfo, onClose, onUpdated }: Props) => {
  const { t } = useTranslation();
  const updateNameRequest = useApi(updateName);
  const updateProfileRequest = useApi(updateProfile);
  const updateCustomDataRequest = useApi(updateCustomData);
  const handleError = useErrorHandler();

  const fields = useMemo(() => buildEditableFields(field, userInfo, t), [field, t, userInfo]);

  const [values, setValues] = useState<Record<string, EditableValue>>({});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    setValues(Object.fromEntries(fields.map(({ name, value }) => [name, value])));
    setErrors({});
  }, [fields]);

  const validate = useCallback(() => {
    const nextErrors = Object.fromEntries(
      fields.map((field) => [field.name, getValidationError(values[field.name] ?? '', field, t)])
    );

    setErrors(nextErrors);
    return Object.values(nextErrors).every((error) => !error);
  }, [fields, t, values]);

  const handleSubmit = useCallback(async () => {
    if (!field || !validate()) {
      return;
    }

    const [firstField] = fields;
    const [error] =
      field.controlKey === 'name'
        ? await updateNameRequest({ name: getProfileValue(values.name ?? '').trim() || null })
        : field.controlKey === 'customData' && firstField
          ? await updateCustomDataRequest({
              ...userInfo?.customData,
              [field.name]: getCustomDataValue(firstField, values[field.name] ?? ''),
            } satisfies JsonObject)
          : await updateProfileRequest({
              ...userInfo?.profile,
              ...(field.name === 'address' || field.field?.type === CustomProfileFieldType.Address
                ? {
                    address: {
                      ...userInfo?.profile?.address,
                      ...Object.fromEntries(
                        fields.map(({ name }) => [name, getProfileValue(values[name] ?? '')])
                      ),
                    },
                  }
                : Object.fromEntries(
                    fields.map(({ name }) => [name, getProfileValue(values[name] ?? '')])
                  )),
            });

    if (error) {
      await handleError(error);
      return;
    }

    await onUpdated();
    onClose();
  }, [
    field,
    fields,
    handleError,
    onClose,
    onUpdated,
    updateCustomDataRequest,
    updateNameRequest,
    updateProfileRequest,
    userInfo?.customData,
    userInfo?.profile,
    validate,
    values,
  ]);

  return (
    <ReactModal
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
      isOpen={Boolean(field)}
      className={styles.modal}
      overlayClassName={styles.overlay}
      onRequestClose={onClose}
    >
      {field && (
        <>
          <div className={styles.header}>
            <div className={styles.title}>{t('action.change', { method: field.label })}</div>
            <button type="button" className={styles.closeButton} onClick={onClose}>
              <CloseIcon />
            </button>
          </div>
          <div className={styles.content}>
            {fields.map((editableField) => {
              const value = values[editableField.name] ?? editableField.value;

              return editableField.type === CustomProfileFieldType.Checkbox ? (
                <label key={editableField.name} className={styles.checkboxField}>
                  <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={({ currentTarget }) => {
                      setValues((previous) => ({
                        ...previous,
                        [editableField.name]: currentTarget.checked,
                      }));
                    }}
                  />
                  <span>{editableField.label}</span>
                </label>
              ) : editableField.type === CustomProfileFieldType.Select ? (
                <SelectField
                  key={editableField.name}
                  name={editableField.name}
                  label={editableField.label}
                  value={getProfileValue(value)}
                  options={getSelectOptions(editableField, t('account_center.security.not_set'), t)}
                  description={editableField.description}
                  errorMessage={errors[editableField.name]}
                  required={editableField.required}
                  placeholder={editableField.config?.placeholder}
                  onChange={(value) => {
                    setValues((previous) => ({
                      ...previous,
                      [editableField.name]: value,
                    }));
                  }}
                />
              ) : editableField.type === CustomProfileFieldType.Date ? (
                <DateField
                  key={editableField.name}
                  name={editableField.name}
                  label={editableField.label}
                  dateFormat={getDateFormat(editableField.config)}
                  value={value}
                  description={editableField.description}
                  errorMessage={errors[editableField.name]}
                  isRequired={editableField.required}
                  placeholder={editableField.config?.placeholder}
                  onChange={(value) => {
                    setValues((previous) => ({
                      ...previous,
                      [editableField.name]: value,
                    }));
                  }}
                />
              ) : (
                <InputField
                  key={editableField.name}
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus={fields[0]?.name === editableField.name}
                  name={editableField.name}
                  label={editableField.label}
                  type={editableField.type === CustomProfileFieldType.Number ? 'number' : 'text'}
                  required={editableField.required}
                  value={getProfileValue(value)}
                  description={editableField.description}
                  errorMessage={errors[editableField.name]}
                  isDanger={Boolean(errors[editableField.name])}
                  placeholder={editableField.config?.placeholder}
                  onChange={({ currentTarget }) => {
                    setValues((previous) => ({
                      ...previous,
                      [editableField.name]: currentTarget.value,
                    }));
                  }}
                />
              );
            })}
          </div>
          <div className={styles.footer}>
            <Button title="action.cancel" type="secondary" onClick={onClose} />
            <Button
              title="action.save"
              type="primary"
              onClick={() => {
                void handleSubmit();
              }}
            />
          </div>
        </>
      )}
    </ReactModal>
  );
};

export default EditProfileFieldModal;
