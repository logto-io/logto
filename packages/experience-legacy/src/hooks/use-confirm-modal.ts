import { useContext } from 'react';

import { ConfirmModalContext } from '@/Providers/ConfirmModalProvider';

/**
 * Hook for using the promise-based confirm modal
 *
 * @returns An object with a `show` method that returns a promise
 *
 * Example:
 * ```ts
 * const { show } = usePromiseConfirmModal();
 * const [result] = await show({ ModalContent: 'Are you sure?' });
 * if (result) {
 *   // User confirmed
 * }
 *```
 */
export const usePromiseConfirmModal = () => {
  const { showPromise } = useContext(ConfirmModalContext);

  return { show: showPromise };
};

/**
 * Hook for using the callback-based confirm modal
 *
 * @returns An object with a `show` method that accepts callbacks
 *
 * Example:
 * ```ts
 * const { show } = useConfirmModal();
 * show({
 *  ModalContent: 'Are you sure?',
 *  onConfirm: async () => {
 *    // This will automatically set the confirm button to loading state
 *    await someAsyncOperation();
 *  },
 *  onCancel: async () => {
 *    // This will automatically set the cancel button to loading state
 *    await someAsyncOperation();
 *  }
 * });
 * ```
 */
export const useConfirmModal = () => {
  const { showCallback } = useContext(ConfirmModalContext);

  return { show: showCallback };
};
