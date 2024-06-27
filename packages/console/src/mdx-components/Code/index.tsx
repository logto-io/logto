import CodeEditor from '@/ds-components/CodeEditor';

import Mermaid from '../Mermaid';

export default function Code({ className, children }: JSX.IntrinsicElements['code']) {
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
    />
  ) : (
    <code>{String(children).trimEnd()}</code>
  );
}
