import { Helmet } from 'react-helmet';

import { shouldReport, gtagAwTrackingId, plausibleDataDomain } from './utils';

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
        gtag('consent', 'default', {
          'ad_storage': 'denied',
          'ad_user_data': 'denied',
          'ad_personalization': 'denied',
          'analytics_storage': 'denied'
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
        data-api="https://akasha.logto.io/placebo/eagan"
        src="https://akasha.logto.io/placebo/sabaean.manual.js"
      />
      <script>{`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}</script>
    </Helmet>
  );
}

/**
 * Renders global scripts for conversion tracking.
 */
export function GlobalScripts() {
  if (!shouldReport) {
    return null;
  }

  return (
    <>
      <PlausibleScripts />
      <GoogleScripts />
    </>
  );
}
