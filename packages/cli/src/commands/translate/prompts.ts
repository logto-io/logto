import { type LanguageTag } from '@logto/language-kit';
import { conditionalString } from '@silverhand/essentials';

type GetTranslationPromptProperties = {
  sourceFileContent: string;
  targetLanguage: LanguageTag;
  extraPrompt?: string;
};

export const getTranslationPrompt = ({
  sourceFileContent,
  targetLanguage,
  extraPrompt,
}: GetTranslationPromptProperties) => `Given the following code snippet:
\`\`\`ts
${sourceFileContent}
\`\`\`
only translate object values to ${targetLanguage}, keep all object keys original, output ts code only, and the code format should be strictly consistent.

Take zh-cn as an example, if the input is:
\`\`\`ts
import others from './others.js';

const translation = {
  hello: '你好',
  world: 'world', // UNTRANSLATED
  others,
};

export default translation;

\`\`\`
the output should be:
\`\`\`ts
import others from './others.js';

const translation = {
  hello: '你好',
  world: '世界',
  others,
};

export default translation;

\`\`\`
${conditionalString(extraPrompt)}`;
