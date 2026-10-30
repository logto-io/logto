import { ApplicationType } from '@logto/schemas';
import { appendPath } from '@silverhand/essentials';
import { type Ref, forwardRef } from 'react';

import { type GuideMetadata } from '@/assets/docs/guides/types';
import { isDevFeaturesEnabled } from '@/consts/env';
import TextLink from '@/ds-components/TextLink';

import Step, { type Props as StepProps } from '../Step';

type Props = Omit<StepProps, 'children'> & {
  readonly fullGuide: GuideMetadata['fullGuide'];
  readonly furtherReadings: GuideMetadata['furtherReadings'];
  readonly target: GuideMetadata['target'];
};

const quickStartsUrl = new URL('https://docs.logto.io/quick-starts/');

const stepUpAuthenticationTargets: ReadonlySet<GuideMetadata['target']> = new Set([
  ApplicationType.SPA,
  ApplicationType.Traditional,
  ApplicationType.Native,
]);

function FurtherReadings(props: Props, ref?: Ref<HTMLDivElement>) {
  const { fullGuide, furtherReadings, target, ...stepProps } = props;
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
        {/* DEV: OIDC step-up authentication. */}
        {isDevFeaturesEnabled && stepUpAuthenticationTargets.has(target) && (
          <li>
            <TextLink
              href="https://docs.logto.io/end-user-flows/step-up-authentication"
              targetBlank="noopener"
            >
              Require MFA or a recent sign-in before sensitive operations (step-up authentication)
            </TextLink>
          </li>
        )}
      </ul>
    </Step>
  );
}

export default forwardRef<HTMLDivElement, Props>(FurtherReadings);
