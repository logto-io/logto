import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import { isProduction } from '@/consts/env';
import useCurrentUser from '@/hooks/use-current-user';

import { useRetry } from './use-retry';
import { shouldReport, gtagAwTrackingId, redditPixelId, hashEmail } from './utils';

const debug = (...args: Parameters<(typeof console)['debug']>) => {
  if (!isProduction) {
    console.debug(...args);
  }
};

type ScriptProps = {
  userEmailHash?: string;
};

function GoogleScripts({ userEmailHash }: ScriptProps) {
  useRetry({
    precondition: Boolean(userEmailHash),
    execute: () => {
      if (!window.gtag) {
        return false;
      }

      debug('<GoogleScripts>:', 'userEmailHash =', userEmailHash);
      window.gtag('set', 'user_data', {
        sha256_email_address: userEmailHash,
      });
      return true;
    },
  });

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
        gtag('config', '${gtagAwTrackingId}', {'allow_enhanced_conversions': true});
      `}</script>
    </Helmet>
  );
}

function RedditScripts({ userEmailHash }: ScriptProps) {
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

  if (!shouldReport) {
    return null;
  }

  return (
    <>
      <GoogleScripts userEmailHash={userEmailHash} />
      <RedditScripts userEmailHash={userEmailHash} />
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
    execute: () => {
      if (!window.gtag) {
        return false;
      }

      debug('useReportConversion():', 'gtagId =', gtagId);
      window.gtag('event', 'conversion', {
        send_to: gtagId,
      });

      return true;
    },
  });

  useRetry({
    precondition: Boolean(shouldReport && redditType),
    execute: () => {
      if (!window.rdt) {
        return false;
      }

      debug('useReportConversion():', 'redditType =', redditType);
      window.rdt('track', redditType);

      return true;
    },
  });
};
