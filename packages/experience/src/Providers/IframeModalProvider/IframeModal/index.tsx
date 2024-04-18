import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import ReactModal from 'react-modal';
import type { LoadingBarRef } from 'react-top-loading-bar';
import LoadingBar from 'react-top-loading-bar';

import NavBar from '@/components/NavBar';

import * as styles from './index.module.scss';

type ModalProps = {
  readonly className?: string;
  readonly title?: string;
  readonly href?: string;
  readonly onClose: () => void;
};

const IframeModal = ({ className, title = '', href = '', onClose }: ModalProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const loadingBarRef = useRef<LoadingBarRef>(null);

  const brandingColor = document.body.style.getPropertyValue('--color-brand-default') || '#5d34f2';

  return (
    <ReactModal
      shouldCloseOnEsc
      id="iframe-modal"
      role="dialog"
      isOpen={Boolean(href)}
      className={classNames(styles.modal, className)}
      overlayClassName={styles.overlay}
      closeTimeoutMS={300}
      onAfterOpen={() => {
        loadingBarRef.current?.continuousStart();
      }}
      onRequestClose={onClose}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <NavBar type="close" title={title} onClose={onClose} />
        </div>
        <LoadingBar
          ref={loadingBarRef}
          containerStyle={{ position: 'relative' }}
          shadow={false}
          color={brandingColor}
          waitingTime={300}
          className={styles.loader}
        />
        <div className={styles.content}>
          <iframe
            title={title}
            src={href}
            sandbox="allow-same-origin"
            className={conditional(isLoaded && styles.loaded)}
            onLoad={() => {
              setIsLoaded(true);
              loadingBarRef.current?.complete();
            }}
            onError={() => {
              setIsLoaded(true);
              loadingBarRef.current?.complete();
            }}
          />
        </div>
      </div>
    </ReactModal>
  );
};

export default IframeModal;
