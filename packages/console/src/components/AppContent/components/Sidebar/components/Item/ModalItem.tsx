import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import useModalControl from '@/hooks/use-modal-control';

import * as styles from './index.module.scss';

export type Props = {
  name: string;
  modal: (isOpen: boolean, onCancel: () => void) => ReactNode;
  content: ReactNode;
};

const ModalItem = ({ name, modal, content }: Props) => {
  const { open, isOpen } = useModalControl(name);
  const navigate = useNavigate();

  return (
    <>
      <button
        className={styles.row}
        onClick={() => {
          open();
        }}
      >
        {content}
      </button>
      {modal(isOpen, () => {
        navigate(-1);
      })}
    </>
  );
};

export default ModalItem;
