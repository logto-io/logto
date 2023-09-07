import { type AdminConsoleKey } from '@logto/phrases';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import TextInput from '@/ds-components/TextInput';
import useMeCustomData from '@/hooks/use-me-custom-data';
import * as modalStyles from '@/scss/modal.module.scss';

type Props = {
  title: AdminConsoleKey;
  fieldLabel: AdminConsoleKey;
  fieldPlaceholder: AdminConsoleKey;
  successMessage: AdminConsoleKey;
  isOpen: boolean;
  onClose: () => void;
};

export default function RequestForm({
  title,
  fieldLabel,
  fieldPlaceholder,
  successMessage,
  isOpen,
  onClose,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { data, update } = useMeCustomData();
  const guideRequests = data?.guideRequests;

  const submit = async () => {
    setIsLoading(true);
    try {
      await update({
        guideRequests: Array.isArray(guideRequests)
          ? guideRequests.concat(inputValue)
          : [inputValue],
      });
    } catch {
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    setInputValue('');
    onClose();
    toast.success(String(t(successMessage)));
  };

  return (
    <ReactModal
      shouldCloseOnEsc
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onClose}
    >
      <ModalLayout
        title={<DynamicT forKey={title} />}
        footer={
          <Button
            size="large"
            type="primary"
            title="general.submit"
            isLoading={isLoading}
            disabled={!inputValue}
            onClick={submit}
          />
        }
        onClose={onClose}
      >
        <FormField title={<DynamicT forKey={fieldLabel} />}>
          <TextInput
            /** The i18n value is already string here. */
            placeholder={String(t(fieldPlaceholder))}
            value={inputValue}
            onChange={({ currentTarget: { value } }) => {
              setInputValue(value);
            }}
          />
        </FormField>
      </ModalLayout>
    </ReactModal>
  );
}
