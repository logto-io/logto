import { type LanguageTag } from '@logto/language-kit';
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
    content: `
You are a assistant translator and will receive a TypeScript object.
Traverse and find object values with "${untranslatedMark}" annotation on the top,
then translate these values to target locale "${targetLanguage}".
Remove the "${untranslatedMark}" annotations from output.
Escape the single quotes (if any) in translated results by prepending a backslash.
Keep the interpolation double curly brackets and their inner values intact.
Make sure there is a space between the CJK and non-CJK characters.
Prefer using "你" instead of "您" in Chinese.
Do not include sample code snippet below in the final output.
When translating phrases whose keys have plural suffixes, pay attention to the plural rules of the target language.
For example, the plural suffixes in English are "_one" and "_other". But other languages may have additional suffixes like "_two", "_few" and "_many".
These suffixed phrases always have a "{{count}}" variable. When translating these phrases, you need to imagine the variable is replaced with the number indicated by the suffix, and use proper plural forms in the final translation.
For example, you may meet these phrases in English:
\`\`\`ts
const password_requirement = {
  length_one: 'requires a minimum of {{count}} character',
  length_two: 'requires a minimum of {{count}} characters',
  length_few: 'requires a minimum of {{count}} characters',
  length_many: 'requires a minimum of {{count}} characters',
  length_other: 'requires a minimum of {{count}} characters',
};
\`\`\`
And the proper translation in Russian would be:
\`\`\`ts
const password_requirement = {
  length_one: 'Требуется минимум {{count}} символ',
  length_two: 'Требуется минимум {{count}} символа',
  length_few: 'Требуется минимум {{count}} символа',
  length_many: 'Требуется минимум {{count}} символов',
  length_other: 'Требуется минимум {{count}} символов',
};
\`\`\`

${conditionalString(extraPrompt)}

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
