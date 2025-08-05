import { ForgotPasswordMethod } from '@logto/schemas';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Plus from '@/assets/icons/plus.svg?react';
import ActionMenu from '@/ds-components/ActionMenu';
import { DragDropProvider, DraggableItem } from '@/ds-components/DragDrop';
import { DropdownItem } from '@/ds-components/Dropdown';
import FormField from '@/ds-components/FormField';

import type { SignInExperienceForm } from '../../../../types';
import FormFieldDescription from '../../../components/FormFieldDescription';

import VerificationMethodItem from './VerificationMethodItem';
import styles from './index.module.scss';
import { forgotPasswordMethodPhrase } from './utils';

function ForgotPasswordMethodEditBox() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { control } = useFormContext<SignInExperienceForm>();

  return (
    <FormField title="sign_in_exp.sign_up_and_sign_in.sign_in.forgot_password_verification_method">
      <FormFieldDescription>
        {t('sign_in_exp.sign_up_and_sign_in.sign_in.forgot_password_description')}
      </FormFieldDescription>
      <Controller
        control={control}
        defaultValue={[]}
        name="forgotPasswordMethods"
        render={({ field: { value, onChange } }) => {
          const methods = value ?? [];
          const availableMethods = Object.values(ForgotPasswordMethod).filter(
            (method) => !methods.includes(method)
          );

          const handleAddMethod = (method: ForgotPasswordMethod) => {
            onChange([...methods, method]);
          };

          const handleRemoveMethod = (method: ForgotPasswordMethod) => {
            onChange(
              methods.filter((currentMethod: ForgotPasswordMethod) => currentMethod !== method)
            );
          };

          const handleSwapMethods = (dragIndex: number, hoverIndex: number) => {
            const dragItem = methods[dragIndex];
            const hoverItem = methods[hoverIndex];

            if (!dragItem || !hoverItem) {
              return;
            }

            onChange(
              methods.map((method: ForgotPasswordMethod, index: number) => {
                if (index === dragIndex) {
                  return hoverItem;
                }
                if (index === hoverIndex) {
                  return dragItem;
                }
                return method;
              })
            );
          };

          return (
            <div>
              <DragDropProvider>
                {methods.map((method: ForgotPasswordMethod, index: number) => (
                  <DraggableItem
                    key={method}
                    id={method}
                    sortIndex={index}
                    moveItem={handleSwapMethods}
                    className={styles.draggleItemContainer}
                  >
                    <VerificationMethodItem
                      method={method}
                      onRemove={() => {
                        handleRemoveMethod(method);
                      }}
                    />
                  </DraggableItem>
                ))}
              </DragDropProvider>
              {availableMethods.length > 0 && (
                <ActionMenu
                  isDropdownFullWidth
                  buttonProps={{
                    type: 'default',
                    size: 'medium',
                    title: 'sign_in_exp.sign_up_and_sign_in.sign_in.add_verification_method',
                    icon: <Plus className={styles.plusIcon} />,
                  }}
                  dropdownHorizontalAlign="start"
                >
                  {availableMethods.map((method) => (
                    <DropdownItem
                      key={method}
                      onClick={() => {
                        handleAddMethod(method);
                      }}
                    >
                      {t(forgotPasswordMethodPhrase[method])}
                    </DropdownItem>
                  ))}
                </ActionMenu>
              )}
            </div>
          );
        }}
      />
    </FormField>
  );
}

export default ForgotPasswordMethodEditBox;
