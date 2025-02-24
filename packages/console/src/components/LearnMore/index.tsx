import { type AdminConsoleKey } from '@logto/phrases';

import DynamicT from '@/ds-components/DynamicT';
import TextLink, { type Props as TextLinkProps } from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';

export type Props = {
  readonly href: string;
  readonly customI18nKey?: AdminConsoleKey;
  readonly hasLeadingSpace?: boolean;
  readonly isRelativeDocUrl?: boolean;
  readonly targetBlank?: TextLinkProps['targetBlank'];
};

function LearnMore({
  href,
  customI18nKey = 'general.learn_more',
  hasLeadingSpace = true,
  // eslint-disable-next-line unicorn/prevent-abbreviations
  isRelativeDocUrl = true,
  targetBlank = 'noopener',
}: Props) {
  const { getDocumentationUrl } = useDocumentationUrl();

  return (
    <>
      {hasLeadingSpace && ' '}
      <TextLink
        href={isRelativeDocUrl && !href.startsWith('https://') ? getDocumentationUrl(href) : href}
        targetBlank={targetBlank}
      >
        <DynamicT forKey={customI18nKey} />
      </TextLink>
    </>
  );
}

export default LearnMore;
