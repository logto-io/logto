import { condString, joinPath } from '@silverhand/essentials';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { consoleEmbeddedPricingUrl } from '@/consts/env';
import Card from '@/ds-components/Card';
import useTheme from '@/hooks/use-theme';
import useUserPreferences from '@/hooks/use-user-preferences';

import Skeleton from './Skeleton';
import styles from './index.module.scss';

const websiteSender = 'website_console_embed_pricing';
const sender = 'console_pricing';

enum MessageType {
  RequestContentHeight = 'requestContentHeight',
  ReportContentHeight = 'reportContentHeight',
  ChangeTheme = 'changeTheme',
}

type MessageData = {
  sender: string;
  type: MessageType;
  payload?: {
    theme?: 'light' | 'dark';
    height?: number;
  };
};

function ConsoleEmbeddedPricing() {
  const [height, setHeight] = useState<number | undefined>(window.innerHeight);
  const pricingContentRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const theme = useTheme();
  const {
    data: { language },
  } = useUserPreferences();

  const pricingContentUrl = useMemo(() => {
    const baseUrl = new URL(condString(consoleEmbeddedPricingUrl));
    const { origin, pathname } = baseUrl;

    const localizedUrl = new URL(
      joinPath(
        // Ignore language tag if it's English
        condString(language !== 'en' && language),
        pathname
      ),
      origin
    );
    localizedUrl.searchParams.set('theme', theme);

    return localizedUrl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    /**
     * Intentionally not including `theme` in the dependency array, the `theme` here is only used for the initial rendering
     * and will update using the postMessage to avoid page reload when changing the theme.
     */
    language,
  ]);

  const iframeOnLoadEventHandler = useCallback(() => {
    setIframeLoaded(true);
  }, []);

  useEffect(() => {
    setIframeLoaded(false);

    const iframe = pricingContentRef.current;

    iframe?.addEventListener('load', iframeOnLoadEventHandler);

    return () => {
      iframe?.removeEventListener('load', iframeOnLoadEventHandler);
    };
  }, [pricingContentUrl, iframeOnLoadEventHandler]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<MessageData>) => {
      if (event.data.sender !== websiteSender) {
        return;
      }

      if (event.data.type === MessageType.ReportContentHeight) {
        const { height } = event.data.payload ?? {};
        if (height !== undefined) {
          setHeight(height);
          /**
           * Force the browser to recalculate the scroll area by triggering a resize event
           */
          window.dispatchEvent(new Event('resize'));
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    if (!iframeLoaded) {
      return;
    }

    // Request the height of the iframe in the next tick to ensure the iframe is ready to receive messages
    const requestContentHeightTimeout = setTimeout(() => {
      pricingContentRef.current?.contentWindow?.postMessage(
        {
          sender,
          type: MessageType.RequestContentHeight,
        },
        pricingContentUrl.origin
      );
      window.dispatchEvent(new Event('resize'));
    }, 200);

    return () => {
      clearTimeout(requestContentHeightTimeout);
    };
  }, [pricingContentUrl, iframeLoaded]);

  useEffect(() => {
    if (!iframeLoaded) {
      return;
    }

    pricingContentRef.current?.contentWindow?.postMessage(
      {
        sender,
        type: MessageType.ChangeTheme,
        payload: {
          theme,
        },
      },
      pricingContentUrl.origin
    );
  }, [iframeLoaded, pricingContentUrl, theme]);

  return (
    <Card className={styles.container}>
      {!iframeLoaded && <Skeleton />}
      <iframe
        ref={pricingContentRef}
        className={styles.iframe}
        src={pricingContentUrl.toString()}
        sandbox={undefined}
        title="Console embed pricing table"
        height={height}
        style={{ display: iframeLoaded ? 'block' : 'none' }}
      />
    </Card>
  );
}

export default ConsoleEmbeddedPricing;
