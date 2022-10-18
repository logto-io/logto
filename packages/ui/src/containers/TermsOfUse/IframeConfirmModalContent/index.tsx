import { useState } from 'react';

import { LoadingIcon } from '@/components/LoadingLayer';

import * as styles from './index.module.scss';

type Props = { url?: string; title?: string };

const IframeConfirmModalContent = ({ url, title }: Props) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <LoadingIcon />}
      <iframe
        role="article"
        sandbox={undefined}
        className={isLoading ? styles.hidden : styles.iframe}
        src={url}
        title={title}
        frameBorder="0"
        width="100%"
        height="100%"
        onLoad={() => {
          setIsLoading(false);
        }}
        onError={() => {
          setIsLoading(false);
        }}
      />
    </>
  );
};

export default IframeConfirmModalContent;

export const createIframeConfirmModalContent = (url?: string, title?: string) => (
  <IframeConfirmModalContent url={url} title={title} />
);
