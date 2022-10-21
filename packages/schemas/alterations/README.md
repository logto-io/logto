# Database alteration

The folder for all alteration files.

## Format

The alteration files are named in the format of `<version>-<timestamp>-name.js` where `<timestamp>` is the unix timestamp of when the alteration was created and `name` is the name of the alteration, `version` is this npm package's version number.

As for development, the `version` is "next" until the package is released.

Note that, you SHOULD NOT change the content of the alteration files after they are created. If you need to change the alteration, you should create a new alteration file with the new content.

## Deploy unreleased alterations

To deploy scripts with the `next` version, run `pnpm alteration deploy next`. This is helpful if you want to test your alteration scripts.

## Typing

```ts
type AlterationScript = {
  up: (connection: DatabaseTransactionConnection) => Promise<void>;
  down: (connection: DatabaseTransactionConnection) => Promise<void>;
};
```

When the alteration script is executed, the `up` function is called to alter the database schema.

The `down` function is designed for the future downgrade feature.

## Example

```ts
export const up = async (connection) => {
  await connection.query(`
    alter table "user"
    add column "email" varchar(255) not null;
  `);
};

export const down = async (connection) => {
  await connection.query(`
    alter table "user"
    drop column "email";
  `);
};
```
