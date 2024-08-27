import { createContext } from '@lit/context';
import { noop } from '@silverhand/essentials';

/** @see {@link ModalContext} */
export type ModalContextType = { onClose: () => void };

/**
 * Context for the modal component. It's useful for operating the modal from deep in the component
 * tree. For example, closing the modal from a child component.
 */
export const ModalContext = createContext<ModalContextType>('modal-context');

/** The default value for the modal context. */
export const modalContext: ModalContextType = {
  onClose: noop,
};
