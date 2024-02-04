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
            href="https://docs.logto.io/docs/recipes/configure-connectors/"
            targetBlank="noopener"
          >
            Configure connectors
          </TextLink>
        </li>
        <li>
          <TextLink
            href="https://docs.logto.io/docs/recipes/rbac/protect-resource/#client"
            targetBlank="noopener"
          >
            Configure client to use RBAC
          </TextLink>
        </li>
      </ul>
    </Step>
  );
}

export default forwardRef<HTMLDivElement, Props>(FurtherReadings);
