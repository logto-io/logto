import { useContext, useEffect, useState } from 'react';

import { getEventName, type Component, type EventType } from '../custom-event.js';

import { AppInsightsContext } from './context.js';

type Props<C extends Component> = {
  component: C;
  event: EventType<C>;
};

const TrackOnce = <C extends Component>({ component, event }: Props<C>) => {
  const [tracked, setTracked] = useState(false);
  const { isSetupFinished, appInsights } = useContext(AppInsightsContext);

  useEffect(() => {
    if (isSetupFinished && !tracked) {
      appInsights.instance?.trackEvent({
        name: getEventName(component, event),
      });
      setTracked(true);
    }
  }, [appInsights.instance, component, event, isSetupFinished, tracked]);

  return null;
};

export default TrackOnce;
