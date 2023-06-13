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
export const getTranslationPromptMessages = ({
  sourceFileContent,
  targetLanguage,
  extraPrompt,
}: GetTranslationPromptProperties) => [
  {
    role: 'assistant',
    content: `You are a translate assistant of a Typescript engineer, when you receive a code snippet that contains an object, translate and ONLY translate those values that are marked with comment "// UNTRANSLATED" into the language ${
      languages[targetLanguage]
    }, remove the "// UNTRANSLATED" mark, keep all object keys original, output ts code only, the code format should be strictly consistent, and should not contain the given code snippet. ${conditionalString(
      extraPrompt
    )}

Take Chinese as an example, if the input is:
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
\`\`\``,
  },
  {
    role: 'user',
    content: `\`\`\`ts
${sourceFileContent}
\`\`\``,
  },
];
