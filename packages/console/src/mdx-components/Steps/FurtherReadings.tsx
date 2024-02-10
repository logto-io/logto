import { type Ref, forwardRef } from 'react';

import { type GuideMetadata } from '@/assets/docs/guides/types';
import TextLink from '@/ds-components/TextLink';

import Step, { type Props as StepProps } from '../Step';

type Props = Omit<StepProps, 'children'> & {
  fullTutorial: GuideMetadata['fullTutorial'];
};

function FurtherReadings(props: Props, ref?: Ref<HTMLDivElement>) {
  const { fullTutorial, ...stepProps } = props;
  return (
    <Step ref={ref} {...stepProps}>
      <ul>
        {fullTutorial && (
          <li>
            <TextLink href={fullTutorial.url} targetBlank="noopener">
              {fullTutorial.title}
            </TextLink>
          </li>
        )}
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
