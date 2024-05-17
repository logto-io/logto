import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import useCurrentUser from '@/hooks/use-current-user';

import {
  shouldReport,
  gtagAwTrackingId,
  redditPixelId,
  hashEmail,
  plausibleDataDomain,
} from './utils';

type ScriptProps = {
  readonly userEmailHash?: string;
};

function GoogleScripts({ userEmailHash }: ScriptProps) {
  if (!userEmailHash) {
    return null;
  }

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
        gtag('config', '${gtagAwTrackingId}', { 'allow_enhanced_conversions': true });
        gtag('set', 'user_data', { 'sha256_email_address': '${userEmailHash}' });
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

function PlausibleScripts() {
  return (
    <Helmet>
      <script
        async
        defer
        data-domain={plausibleDataDomain}
        src="https://plausible.io/js/plausible.manual.js"
      />
      <script>{`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}</script>
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
      <PlausibleScripts />
      <GoogleScripts userEmailHash={userEmailHash} />
      <RedditScripts userEmailHash={userEmailHash} />
    </>
  );
}
