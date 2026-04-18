import { type CustomProfileField } from '@logto/schemas';
import { useMemo } from 'react';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import CirclePlus from '@/assets/icons/circle-plus.svg?react';
import Plus from '@/assets/icons/plus.svg?react';
import ActionMenu from '@/ds-components/ActionMenu';
import type { Props as ButtonProps } from '@/ds-components/Button';
import { DragDropProvider, DraggableItem } from '@/ds-components/DragDrop';
import { DropdownItem } from '@/ds-components/Dropdown';
import TextLink from '@/ds-components/TextLink';
import { type RequestError } from '@/hooks/use-api';

import { type SignInExperienceForm } from '../../../../types';
import { collectUserProfilePathname } from '../../../CollectUserProfile/consts';
import useI18nFieldLabel from '../../../CollectUserProfile/use-i18n-field-label';

import SignUpProfileFieldItem from './SignUpProfileFieldItem';
import styles from './index.module.scss';

function SignUpProfileFieldsEditBox() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { control } = useFormContext<SignInExperienceForm>();
  const getI18nLabel = useI18nFieldLabel();

  const { data: catalog } = useSWR<CustomProfileField[], RequestError>('api/custom-profile-fields');

  const signUpProfileFields = useWatch({ control, name: 'signUpProfileFields' });

  const { fields, swap, remove, append } = useFieldArray({
    control,
    name: 'signUpProfileFields',
  });

  const availableFields = useMemo(() => {
    if (!catalog) {
      return [];
    }
    const selectedNames = new Set(signUpProfileFields.map(({ name }) => name));
    return catalog.filter(({ name }) => !selectedNames.has(name));
  }, [catalog, signUpProfileFields]);

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
    title: 'sign_in_exp.sign_up_and_sign_in.sign_up.add_profile_fields',
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
          return (
            <DraggableItem
              key={id}
              id={id}
              sortIndex={index}
              moveItem={swap}
              className={styles.draggleItemContainer}
            >
              <Controller
                control={control}
                name={`signUpProfileFields.${index}`}
                render={({ field: { value } }) => (
                  <SignUpProfileFieldItem
                    label={fieldLabelByName.get(value.name) ?? value.name}
                    onDelete={() => {
                      remove(index);
                    }}
                  />
                )}
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
          {availableFields.map(({ name, label }) => (
            <DropdownItem
              key={name}
              onClick={() => {
                append({ name });
              }}
            >
              {label || getI18nLabel(name)}
            </DropdownItem>
          ))}
        </ActionMenu>
      )}
      <div className={styles.setUpHint}>
        {t('sign_in_exp.sign_up_and_sign_in.sign_up.profile_fields_hint.not_in_list')}
        <TextLink to={collectUserProfilePathname} className={styles.setup}>
          {t('sign_in_exp.sign_up_and_sign_in.sign_up.profile_fields_hint.set_up')}
        </TextLink>
        {t('sign_in_exp.sign_up_and_sign_in.sign_up.profile_fields_hint.go_to')}
      </div>
    </div>
  );
}

export default SignUpProfileFieldsEditBox;
