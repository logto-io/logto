import { useCallback } from 'react';
import { create } from 'react-modal-promise';

import { ConfirmModalProps } from '@/components/ConfirmModal/ConfirmModal';
import ConfirmPromiseModal from '@/components/ConfirmModal/ConfirmPromiseModal';

type UseConfirmModalProps = Omit<ConfirmModalProps, 'isOpen' | 'onCancel' | 'onConfirm'>;

const useConfirmModal = () => {
  const confirm = useCallback(async (props: UseConfirmModalProps) => {
    try {
      await create(ConfirmPromiseModal)(props);

      return true;
    } catch {
      return false;
    }
  }, []);

  return { confirm };
};

export default useConfirmModal;
