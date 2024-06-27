import { appendPath } from '@silverhand/essentials';
import { type Ref, forwardRef } from 'react';

import { type GuideMetadata } from '@/assets/docs/guides/types';
import TextLink from '@/ds-components/TextLink';

import Step, { type Props as StepProps } from '../Step';

type Props = Omit<StepProps, 'children'> & {
  readonly fullGuide: GuideMetadata['fullGuide'];
  readonly furtherReadings: GuideMetadata['furtherReadings'];
};

const quickStartsUrl = new URL('https://docs.logto.io/quick-starts/');

function FurtherReadings(props: Props, ref?: Ref<HTMLDivElement>) {
  const { fullGuide, furtherReadings, ...stepProps } = props;
  return (
    <Step ref={ref} {...stepProps}>
      <ul>
        {fullGuide && (
          <li>
            <TextLink href={appendPath(quickStartsUrl, fullGuide).href} targetBlank="noopener">
              Complete guide
            </TextLink>
          </li>
        )}
        {furtherReadings?.map(({ title, url }) => (
          <li key={title}>
            <TextLink href={url.href} targetBlank="noopener">
              {title}
            </TextLink>
          </li>
        ))}
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
