import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import TextInput from '@/ds-components/TextInput';
import useMeCustomData from '@/hooks/use-me-custom-data';
import * as modalStyles from '@/scss/modal.module.scss';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function RequestGuide({ isOpen, onClose }: Props) {
  const [inputValue, setInputValue] = useState('');
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
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
    toast.success(t('applications.guide.request_guide_successfully'));
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
        title="applications.guide.cannot_find_guide"
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
        <FormField title="applications.guide.describe_guide_looking_for">
          <TextInput
            placeholder={t('applications.guide.describe_guide_looking_for_placeholder')}
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
