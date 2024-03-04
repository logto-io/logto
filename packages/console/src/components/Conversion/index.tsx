import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import useCurrentUser from '@/hooks/use-current-user';

import { useRetry } from './use-retry';
import { shouldReport, gtagAwTrackingId, redditPixelId, hashEmail } from './utils';

function GoogleScripts() {
  return (
    <Helmet>
      <script
        async
        crossOrigin="anonymous"
        src={`https://www.googletagmanager.com/gtag/js?id=${gtagAwTrackingId}`}
      />
      <script>{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gtagAwTrackingId}');
      `}</script>
    </Helmet>
  );
}

function RedditScripts() {
  const { user, isLoaded } = useCurrentUser();
  const [userEmailHash, setUserEmailHash] = useState<string>();

  /**
   * Initiate Reddit Pixel when user is loaded.
   * Use user email to prevent duplicate conversion, and it is hashed before sending
   * to protect user privacy.
   */
  useEffect(() => {
    const init = async () => {
      setUserEmailHash(await hashEmail(user?.primaryEmail ?? undefined));
    };

    if (isLoaded) {
      void init();
    }
  }, [user, isLoaded]);

  if (!userEmailHash) {
    return null;
  }

  return (
    <Helmet>
      <script>{`
        !function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);
        rdt('init', '${redditPixelId}', {
          optOut: false,
          useDecimalCurrencyValues: true,
          email: '${userEmailHash}'
        });
      `}</script>
    </Helmet>
  );
}

/**
 * Renders global scripts for conversion tracking.
 */
export function GlobalScripts() {
  useEffect(() => {
    if (!shouldReport) {
      console.debug("Not initiating global scripts because it's not production");
    }
  }, []);

  if (!shouldReport) {
    return null;
  }

  return (
    <>
      <GoogleScripts />
      <RedditScripts />
    </>
  );
}

type ReportConversionOptions = {
  gtagId?: string;
  // Add more if needed: https://reddit.my.site.com/helpcenter/s/article/Install-the-Reddit-Pixel-on-your-website
  redditType?: 'PageVisit' | 'ViewContent' | 'Search' | 'Purchase' | 'Lead' | 'SignUp';
};

export const useReportConversion = ({ gtagId, redditType }: ReportConversionOptions) => {
  useRetry({
    precondition: Boolean(shouldReport && gtagId),
    onPreconditionFailed: () => {
      if (shouldReport) {
        console.debug('gtag ID is not available for this conversion, skipping');
      }
    },
    checkCondition: () => Boolean(window.gtag),
    execute: () => {
      if (gtagId) {
        window.gtag?.('event', 'conversion', {
          send_to: gtagId,
        });
      }
    },
  });

  useRetry({
    precondition: Boolean(shouldReport && redditType),
    onPreconditionFailed: () => {
      if (shouldReport) {
        console.debug('Reddit Pixel type is not available for this conversion, skipping');
      }
    },
    checkCondition: () => Boolean(window.rdt),
    execute: () => {
      if (redditType) {
        window.rdt?.('track', redditType);
      }
    },
  });
};
