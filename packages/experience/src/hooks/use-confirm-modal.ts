import { useContext } from 'react';

import { ConfirmModalContext } from '@/Providers/ConfirmModalProvider';

export type { ModalContentRenderProps } from '@/Providers/ConfirmModalProvider';

export const useConfirmModal = () => useContext(ConfirmModalContext);
