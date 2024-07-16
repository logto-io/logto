// https://github.com/parcel-bundler/parcel/pull/7922#issuecomment-1750704973

import { compile } from '@mdx-js/mdx';
import { default as ThrowableDiagnostic } from '@parcel/diagnostic';
import { Transformer } from '@parcel/plugin';
import rehypeMdxCodeProps from 'rehype-mdx-code-props';
import remarkGfm from 'remark-gfm';

export default new Transformer({
  async transform({ asset }) {
    const source = await asset.getCode();

    let codeVFile;

    try {
      codeVFile = await compile(source, {
        development: true,
        jsx: true,
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [remarkGfm],
        rehypePlugins: [[rehypeMdxCodeProps, { tagName: 'code' }]],
      });
    } catch (error) {
      const { start, end } = error.position;

      const highlight = {
        message: error.reason,
        start,
        end,
      };

      if (!(end.line && end.column)) {
        highlight.end = { ...start };
      }

      // Adjust for parser and reporter differences
      highlight.start.column -= 1;
      highlight.end.column -= 1;

      throw new ThrowableDiagnostic({
        diagnostic: {
          message: 'Unable to compile MDX',
          codeFrames: [
            {
              filePath: asset.filePath,
              code: source,
              codeHighlights: [highlight],
            },
          ],
        },
      });
    }

    const code = String(codeVFile);

    asset.type = 'jsx';
    asset.setCode(code);

    return [asset];
  },
});
