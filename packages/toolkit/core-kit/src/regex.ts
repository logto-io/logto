export const emailRegEx = /^\S+@\S+\.\S+$/;
export const phoneRegEx = /^\d+$/;
export const usernameRegEx = /^[A-Z_a-z]\w*$/;
export const webRedirectUriProtocolRegEx = /^https?:$/;
export const mobileUriSchemeProtocolRegEx = /^[a-z][\d_a-z]*(\.[\d_a-z]+)+:$/;
export const hexColorRegEx = /^#[\da-f]{3}([\da-f]{3})?$/i;
export const dateRegex = /^\d{4}(-\d{2}){2}/;
export const noSpaceRegEx = /^\S+$/;

const atLeastOneDigitAndOneLetters = /(?=.*\d)(?=.*[A-Za-z])/;
const atLeastOneDigitAndOneSpecialChar = /(?=.*\d)(?=.*[!"#$%&'()*+,./:;<=>?@[\]^_`{|}~-])/;
const atLeastOneLetterAndOneSpecialChar = /(?=.*[A-Za-z])(?=.*[!"#$%&'()*+,./:;<=>?@[\]^_`{|}~-])/;
const allowedChars = /[\w!"#$%&'()*+,./:;<=>?@[\]^`{|}~-]{8,}/;

export const passwordRegEx = new RegExp(
  `^(${atLeastOneDigitAndOneLetters.source}|${atLeastOneDigitAndOneSpecialChar.source}|${atLeastOneLetterAndOneSpecialChar.source})${allowedChars.source}$`
);
