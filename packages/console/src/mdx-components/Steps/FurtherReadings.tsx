import { type Ref, forwardRef } from 'react';

import TextLink from '@/ds-components/TextLink';

import Step, { type Props as StepProps } from '../Step';

type Props = Omit<StepProps, 'children'>;

function FurtherReadings(props: Props, ref?: Ref<HTMLDivElement>) {
  return (
    <Step ref={ref} {...props}>
      <ul>
        <li>
          <TextLink href="https://docs.logto.io/docs/recipes/customize-sie/" targetBlank="noopener">
            Customize sign-in experience
          </TextLink>
        </li>
        <li>
          <TextLink
            href="https://docs.logto.io/docs/recipes/protect-your-api/"
            targetBlank="noopener"
          >
            Protect your API
          </TextLink>
        </li>
      </ul>
    </Step>
  );
}

export default forwardRef<HTMLDivElement, Props>(FurtherReadings);
