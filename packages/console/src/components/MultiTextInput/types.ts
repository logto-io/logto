export type MultiTextInputError = {
  required?: string;
  inputs?: Record<number, string | undefined>;
};

export type MultiTextInputRule = {
  required?: string;
  pattern?: {
    verify: (value: string) => boolean;
    message: string;
  };
};
