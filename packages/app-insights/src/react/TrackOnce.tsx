import { type ICustomProperties } from '@microsoft/applicationinsights-web';
import { yes } from '@silverhand/essentials';
import { useContext, useEffect } from 'react';

import { getEventName, type Component, type EventType } from '../custom-event.js';

import { AppInsightsContext } from './context.js';

type Props<C extends Component> = {
  component: C;
  event: EventType<C>;
  customProperties?: ICustomProperties;
};

const storageKeyPrefix = 'logto:insights:';

/** Track an event after AppInsights SDK is setup, but only once during the current session.  */
const TrackOnce = <C extends Component>({ component, event, customProperties }: Props<C>) => {
  const { isSetupFinished, appInsights } = useContext(AppInsightsContext);

  useEffect(() => {
    const eventName = getEventName(component, event);
    const storageKey = `${storageKeyPrefix}${eventName}`;
    const tracked = yes(sessionStorage.getItem(storageKey));

    if (isSetupFinished && !tracked) {
      appInsights.instance?.trackEvent(
        {
          name: getEventName(component, event),
        },
        { ...appInsights.utmParameters, ...customProperties }
      );
      sessionStorage.setItem(storageKey, '1');
    }
  }, [
    appInsights.instance,
    appInsights.utmParameters,
    component,
    customProperties,
    event,
    isSetupFinished,
  ]);

  return null;
};

export default TrackOnce;
