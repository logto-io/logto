import { useContext } from 'react';

import { AppConfirmModalContext } from '@/contexts/AppConfirmModalProvider';

export const useConfirmModal = () => useContext(AppConfirmModalContext);
