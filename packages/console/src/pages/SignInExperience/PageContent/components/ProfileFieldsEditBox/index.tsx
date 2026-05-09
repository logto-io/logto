import { type CustomProfileField } from '@logto/schemas';
import { useMemo } from 'react';
import {
  Controller,
  type FieldArrayPath,
  type FieldValues,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import useSWR from 'swr';

import CirclePlus from '@/assets/icons/circle-plus.svg?react';
import Plus from '@/assets/icons/plus.svg?react';
import ActionMenu from '@/ds-components/ActionMenu';
import type { Props as ButtonProps } from '@/ds-components/Button';
import { DragDropProvider, DraggableItem } from '@/ds-components/DragDrop';
import { DropdownItem } from '@/ds-components/Dropdown';
import { type RequestError } from '@/hooks/use-api';

import useI18nFieldLabel from '../../CollectUserProfile/use-i18n-field-label';

import ProfileFieldItem from './ProfileFieldItem';
import styles from './index.module.scss';

type Props<TFieldValues extends FieldValues, TName extends FieldArrayPath<TFieldValues>> = {
  /**
   * The `useFieldArray` path on the surrounding form. The referenced value must be an array of
   * `{ name: string }` objects — each entry pointing at a field in the `custom_profile_fields`
   * catalog.
   */
  readonly name: TName;
  readonly addProfileFieldsButtonTitle: ButtonProps['title'];
  /** Optional hint rendered below the editor (e.g. a link back to the catalog setup page). */
  readonly hint?: React.ReactNode;
  readonly onFieldsChange?: () => void;
  /**
   * Returns a localized hint string when the given field name is currently not allowed, or
   * `undefined` when the field is allowed. Disabled fields stay visible but cannot be added or
   * removed; if already added, the row is shown in a disabled state with a tooltip.
   */
  readonly getFieldDisabledReason?: (fieldName: string) => string | undefined;
};

function ProfileFieldsEditBox<
  TFieldValues extends FieldValues,
  TName extends FieldArrayPath<TFieldValues>,
>({
  name,
  addProfileFieldsButtonTitle,
  hint,
  onFieldsChange,
  getFieldDisabledReason,
}: Props<TFieldValues, TName>) {
  const { control } = useFormContext<TFieldValues>();
  const getI18nLabel = useI18nFieldLabel();

  const { data: catalog } = useSWR<CustomProfileField[], RequestError>('api/custom-profile-fields');

  /* eslint-disable no-restricted-syntax --
   * FieldArrayPath extends FieldPath structurally but react-hook-form's useWatch overloads don't
   * accept it; the return type must be narrowed to the runtime shape.
   */
  const selectedValue = useWatch({
    control,
    name: name as never,
  }) as Array<{ name: string }> | undefined;
  /* eslint-enable no-restricted-syntax */

  const { fields, swap, remove, append } = useFieldArray({ control, name });

  const availableFields = useMemo(() => {
    if (!catalog) {
      return [];
    }
    const selectedNames = new Set((selectedValue ?? []).map(({ name }) => name));
    return catalog.filter(({ name }) => !selectedNames.has(name));
  }, [catalog, selectedValue]);

  const fieldLabelByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const field of catalog ?? []) {
      map.set(field.name, field.label || getI18nLabel(field.name));
    }
    return map;
  }, [catalog, getI18nLabel]);

  const hasSelectedFields = fields.length > 0;

  const addProfileFieldsButtonProps: ButtonProps = {
    type: 'default',
    size: 'medium',
    title: addProfileFieldsButtonTitle,
    icon: <Plus />,
  };

  const addAnotherButtonProps: ButtonProps = {
    type: 'text',
    size: 'small',
    title: 'general.add_another',
    icon: <CirclePlus />,
  };

  return (
    <div>
      <DragDropProvider>
        {fields.map(({ id }, index) => {
          const fieldValue = selectedValue?.[index];
          const currentFieldName = fieldValue?.name;
          const disabledReason = currentFieldName
            ? getFieldDisabledReason?.(currentFieldName)
            : undefined;
          const isDisabled = Boolean(disabledReason);
          return (
            <DraggableItem
              key={id}
              id={id}
              sortIndex={index}
              isDragDisabled={isDisabled}
              moveItem={(from, to) => {
                onFieldsChange?.();
                swap(from, to);
              }}
              className={styles.draggleItemContainer}
            >
              <Controller
                control={control}
                // eslint-disable-next-line no-restricted-syntax -- indexing into a FieldArrayPath is not representable with the FieldPath type
                name={`${name}.${index}` as never}
                render={({ field: { value } }) => {
                  // eslint-disable-next-line no-restricted-syntax -- Controller's value type is generic based on FieldPath which can't narrow to our known shape
                  const fieldName = (value as { name: string }).name;
                  return (
                    <ProfileFieldItem
                      label={fieldLabelByName.get(fieldName) ?? fieldName}
                      isDisabled={isDisabled}
                      disabledHint={disabledReason}
                      onDelete={() => {
                        onFieldsChange?.();
                        remove(index);
                      }}
                    />
                  );
                }}
              />
            </DraggableItem>
          );
        })}
      </DragDropProvider>
      {availableFields.length > 0 && (
        <ActionMenu
          buttonProps={hasSelectedFields ? addAnotherButtonProps : addProfileFieldsButtonProps}
          dropdownHorizontalAlign="start"
          dropdownClassName={styles.addProfileFieldsDropdown}
        >
          {availableFields.map((field) => {
            const { name: fieldName, label } = field;
            const disabledReason = getFieldDisabledReason?.(fieldName);
            return (
              <DropdownItem
                key={fieldName}
                isDisabled={Boolean(disabledReason)}
                tooltip={disabledReason}
                onClick={() => {
                  onFieldsChange?.();
                  // eslint-disable-next-line no-restricted-syntax -- the runtime shape matches the caller's array element
                  append({ name: fieldName } as never);
                }}
              >
                {label || getI18nLabel(fieldName)}
              </DropdownItem>
            );
          })}
        </ActionMenu>
      )}
      {hint && <div className={styles.setUpHint}>{hint}</div>}
    </div>
  );
}

export default ProfileFieldsEditBox;
