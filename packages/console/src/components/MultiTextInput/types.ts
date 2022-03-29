export type MultiTextInputError = {
  required?: string;
  inputs?: Record<number, string | undefined>;
};

export type MultiTextInputRule = {
  required?: string;
  pattern?: {
    regex: RegExp;
    message: string;
  };
};
