export enum SwaggerErrorCode {
  InvalidZodType = 'swagger.invalid_zod_type',
}

export const swaggerErrorMessage: Record<SwaggerErrorCode, string> = {
  [SwaggerErrorCode.InvalidZodType]: 'Invalid Zod type, please check route guard config.',
};
