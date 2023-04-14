import { languages, type LanguageTag } from '@logto/language-kit';
import { conditionalString } from '@silverhand/essentials';

type GetTranslationPromptProperties = {
  sourceFileContent: string;
  targetLanguage: LanguageTag;
  extraPrompt?: string;
};

/**
 * Note:
 * The input token limit of GPT 3.5 is 2048, the following prompt tokens with sourceFileContent is about 1200.
 * Remember to check the token limit before adding more prompt.
 * Tokens can be counted in https://platform.openai.com/tokenizer
 */
export const getTranslationPrompt = ({
  sourceFileContent,
  targetLanguage,
  extraPrompt,
}: GetTranslationPromptProperties) => `Given the following code snippet:
\`\`\`ts
${sourceFileContent}
\`\`\`
only translate object values to ${
  languages[targetLanguage]
}, keep all object keys original, output ts code only, the code format should be strictly consistent, and should not contains the given code snippet.

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
