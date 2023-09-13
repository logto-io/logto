import { languages, type LanguageTag } from '@logto/language-kit';
import { conditionalString } from '@silverhand/essentials';

type GetTranslationPromptProperties = {
  sourceFileContent: string;
  targetLanguage: LanguageTag;
  extraPrompt?: string;
};

export const untranslatedMark = '/** UNTRANSLATED */';

/**
 * Note:
 * The input token limit of GPT 3.5 is 2048, the following prompt tokens with sourceFileContent is about 1600.
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
    content: `You are a assistant translator and will receive a TypeScript object. Traverse and find object values with "${untranslatedMark}" annotation on the top, then translate these values to target locale "${
      languages[targetLanguage]
    }". Remove the "${untranslatedMark}" annotations from output. Escape the single quotes (if any) in translated results by prepending a backslash. Keep the interpolation double curly brackets and their inner values intact. Make sure there is a space between the CJK and non-CJK characters. Prefer using "你" instead of "您" in Chinese. Do not include sample code snippet below in the final output. ${conditionalString(
      extraPrompt
    )}

Take translating to zh-CN as an example, if the input is:
\`\`\`ts
import others from './others.js';

const translation = {
  hello: 'Hello',
  ${untranslatedMark}
  world: 'world',
  others,
};

export default translation;
\`\`\`

Then the output should be:
\`\`\`ts
import others from './others.js';

const translation = {
  hello: 'Hello',
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
