import { useContext } from 'react';

import { ConfirmModalContext } from '@/containers/ConfirmModalProvider';

export const useConfirmModal = () => useContext(ConfirmModalContext);
