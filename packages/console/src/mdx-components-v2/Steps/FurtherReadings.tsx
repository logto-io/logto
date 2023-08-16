import TextLink from '@/ds-components/TextLink';

import Step, { type Props } from '../Step';

export default function FurtherReadings(props: Omit<Props, 'children'>) {
  return (
    <Step {...props}>
      <ul>
        <li>
          <TextLink
            target="blank"
            rel="noopener"
            href="https://docs.logto.io/docs/tutorials/get-started/customize-sign-in-experience"
          >
            Customize sign-in experience
          </TextLink>
        </li>
        <li>
          <TextLink
            target="blank"
            rel="noopener"
            href="https://docs.logto.io/docs/tutorials/get-started/passwordless-sign-in-by-adding-connectors#enable-sms-or-email-passwordless-sign-in"
          >
            Enable SMS or email passwordless sign-in
          </TextLink>
        </li>
        <li>
          <TextLink
            target="blank"
            rel="noopener"
            href="https://docs.logto.io/docs/tutorials/get-started/passwordless-sign-in-by-adding-connectors#enable-social-sign-in"
          >
            Enable social sign-in
          </TextLink>
        </li>
        <li>
          <TextLink
            target="blank"
            rel="noopener"
            href="https://docs.logto.io/docs/recipes/protect-your-api"
          >
            Protect your API
          </TextLink>
        </li>
      </ul>
    </Step>
  );
}
