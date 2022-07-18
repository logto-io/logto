import { z } from 'zod';

export const multiTextInputErrorGuard = z.object({
  required: z.string().optional(),
  inputs: z.record(z.number(), z.string().optional()).optional(),
});

export type MultiTextInputError = z.infer<typeof multiTextInputErrorGuard>;

export type MultiTextInputRule = {
  required?: string;
  pattern?: {
    verify: (value: string) => boolean;
    message: string;
  };
};
