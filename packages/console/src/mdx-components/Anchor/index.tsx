import TextLink from '@/ds-components/TextLink';

/**
 * A custom anchor element that used to swap out the default one in MDX.
 */
export default function Anchor({ children, ...props }: JSX.IntrinsicElements['a']) {
  return (
    <TextLink {...props} targetBlank>
      {children}
    </TextLink>
  );
}
