import { useEffect } from 'react';
import { Helmet } from 'react-helmet';

import useCurrentUser from '@/hooks/use-current-user';

import {
  shouldReport,
  lintrk,
  gtagAwTrackingId,
  linkedInConversionId,
  gtag,
  gtagSignUpConversionId,
  rdt,
  redditAdAccountId,
  hashEmail,
} from './utils';

/**
 * In cloud production environment, this component initiates gtag.js and LinkedIn
 * Insight Tag, then reports a sign-up conversion to them.
 */
export default function ReportConversion() {
  const { user, isLoading } = useCurrentUser();

  /**
   * Initiate Reddit Pixel and report a sign-up conversion to it when user is loaded.
   * Use user email to prevent duplicate conversion, and it is hashed before sending
   * to protect user privacy.
   */
  useEffect(() => {
    const report = async () => {
      rdt('init', redditAdAccountId, {
        optOut: false,
        useDecimalCurrencyValues: true,
        email: await hashEmail(user?.primaryEmail ?? undefined),
      });
      rdt('track', 'SignUp');
    };

    if (shouldReport && !isLoading) {
      void report();
    }
  }, [user, isLoading]);

  /**
   * This `useEffect()` initiates Google Tag and report a sign-up conversion to it.
   * It may run multiple times (e.g. a user visit multiple times to finish the onboarding process,
   * which rarely happens), but it'll be okay since we've set conversion's "Count" to "One"
   * which means only the first interaction is valuable.
   *
   * Track this conversion in the backend has been considered, but Google does not provide
   * a clear guideline for it and marks the [Node library](https://developers.google.com/tag-platform/tag-manager/api/v2/libraries)
   * as "alpha" which looks unreliable.
   */
  useEffect(() => {
    if (shouldReport) {
      gtag('js', new Date());
      gtag('config', gtagAwTrackingId);
      gtag('event', 'conversion', {
        send_to: gtagSignUpConversionId,
      });

      lintrk('track', { conversion_id: linkedInConversionId });
      console.debug('Have a good day!');
    } else {
      console.debug("Not reporting conversion because it's not production");
    }
  }, []);

  if (shouldReport) {
    return (
      <Helmet>
        <script
          async
          crossOrigin="anonymous"
          src={`https://www.googletagmanager.com/gtag/js?id=${gtagAwTrackingId}`}
        />
        <script async src="https://snap.licdn.com/li.lms-analytics/insight.min.js" />
        <script async src="https://www.redditstatic.com/ads/pixel.js" />
      </Helmet>
    );
  }

  return null;
}
