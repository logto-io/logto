import { type Ref, forwardRef } from 'react';

import TextLink from '@/ds-components/TextLink';

import Step, { type Props as StepProps } from '../Step';

type Props = Omit<StepProps, 'children'>;

function FurtherReadings(props: Props, ref?: Ref<HTMLDivElement>) {
  return (
    <Step ref={ref} {...props}>
      <ul>
        <li>
          <TextLink
            target="blank"
            rel="noopener"
            href="https://docs.logto.io/docs/recipes/customize-sie/"
          >
            Customize sign-in experience
          </TextLink>
        </li>
        <li>
          <TextLink
            target="blank"
            rel="noopener"
            href="https://docs.logto.io/docs/recipes/protect-your-api/"
          >
            Protect your API
          </TextLink>
        </li>
      </ul>
    </Step>
  );
}

export default forwardRef<HTMLDivElement, Props>(FurtherReadings);
