export type SchemaValuePrimitive = string | number | boolean | null;
export type SchemaValue = SchemaValuePrimitive | Record<string, unknown>;
export type SchemaLike<Key extends string> = {
  [key in Key]: SchemaValue;
};

export type GeneratedSchema<Schema extends SchemaLike<string>> = keyof Schema extends string
  ? Readonly<{
      table: string;
      fields: {
        [key in keyof Schema]: string;
      };
      fieldKeys: ReadonlyArray<keyof Schema>;
    }>
  : never;

export type OidcModelInstancePayload = Record<string, unknown> & {
  userCode?: string;
  uid?: string;
  grantId?: string;
};

export type OidcClientMetadata = {
  redirect_uris: string[];
  post_logout_redirect_uris: string[];
};
