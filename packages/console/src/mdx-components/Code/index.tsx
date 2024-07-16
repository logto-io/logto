import CodeEditor from '@/ds-components/CodeEditor';

import Mermaid from '../Mermaid';

type Props = JSX.IntrinsicElements['code'] & {
  // eslint-disable-next-line react/boolean-prop-naming -- following the naming convention of the underlying library
  readonly showLineNumbers?: boolean;
};

export default function Code({ className, children, title, showLineNumbers = true }: Props) {
  const [, language] = /language-(\w+)/.exec(String(className ?? '')) ?? [];

  if (language === 'mermaid') {
    return <Mermaid>{String(children).trimEnd()}</Mermaid>;
  }

  return language ? (
    <CodeEditor
      isReadonly
      // We need to transform `ts` to `typescript` for prismjs, and
      // it's weird since it worked in the original Guide component.
      // To be investigated.
      language={language === 'ts' ? 'typescript' : language}
      value={String(children).trimEnd()}
      title={title}
      showLineNumbers={showLineNumbers}
    />
  ) : (
    <code>{String(children).trimEnd()}</code>
  );
}
