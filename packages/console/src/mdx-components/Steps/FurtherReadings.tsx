import { type Ref, forwardRef } from 'react';

import { type GuideMetadata } from '@/assets/docs/guides/types';
import TextLink from '@/ds-components/TextLink';

import Step, { type Props as StepProps } from '../Step';

type Props = Omit<StepProps, 'children'> & {
  readonly fullGuide: GuideMetadata['fullGuide'];
};

function FurtherReadings(props: Props, ref?: Ref<HTMLDivElement>) {
  const { fullGuide, ...stepProps } = props;
  return (
    <Step ref={ref} {...stepProps}>
      <ul>
        {fullGuide && (
          <li>
            <TextLink href={fullGuide.url} targetBlank="noopener">
              {fullGuide.title}
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
