export type SchemaValuePrimitive = string | number | boolean | undefined;
export type SchemaValue = SchemaValuePrimitive | Record<string, unknown>;
export type SchemaLike<Key extends string = string> = {
  [key in Key]: SchemaValue;
};

export type GeneratedSchema<Schema extends SchemaLike> = keyof Schema extends string
  ? Readonly<{
      table: string;
      tableSingular: string;
      fields: {
        [key in keyof Schema]: string;
      };
      fieldKeys: ReadonlyArray<keyof Schema>;
    }>
  : never;
