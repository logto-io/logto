/* eslint-disable max-lines */
import type { User, CreateUser } from '@logto/schemas';
import { MfaFactor, Users } from '@logto/schemas';
import { PhoneNumberParser } from '@logto/shared';
import { cond, conditionalArray, type Nullable, pick } from '@silverhand/essentials';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { EnvSet } from '#src/env-set/index.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import type { Search } from '#src/utils/search.js';
import { buildConditionsFromSearch } from '#src/utils/search.js';
import type { OmitAutoSetFields } from '#src/utils/sql.js';
import { conditionalSql, convertToIdentifiers } from '#src/utils/sql.js';
import { validatePhoneNumber } from '#src/utils/user.js';

import { buildInsertIntoWithPool } from '../database/insert-into.js';

const { table, fields } = convertToIdentifiers(Users);

/**
 * The conditions that connected with `and` operator for finding users. It supports the
 * following:
 *
 * - `search`: The search conditions. It can be combined with various search fields and
 * match modes.
 * - `relation`: The relation conditions. It can be used to find users that have or don't
 * have a relation with another table. Note that the relation field is the raw field name
 * in the database, not the camel case one.
 *
 * @example
 * ```ts
 * // Find users that have a relation with the table `foo` and the field `bar` is `baz`.
 * { relation: { table: 'foo', field: 'bar', value: 'baz', type: 'exists' } }
 * ```
 * @see {@link Search} for more information about the search conditions.
 */
export type UserConditions = {
  search?: Search;
  relation?: {
    table: string;
    field: string;
    value: string;
    type: 'exists' | 'not exists';
  };
};

/**
 * The schema field keys that can be used for searching users. For the actual field names,
 * see {@link Users.fields} and {@link userSearchFields}.
 */
export const userSearchKeys = Object.freeze([
  'id',
  'primaryEmail',
  'primaryPhone',
  'username',
  'name',
] satisfies Array<keyof User>);

/**
 * The actual database field names that can be used for searching users. For the schema field
 * keys, see {@link userSearchKeys}.
 */
export const userSearchFields = Object.freeze(Object.values(pick(Users.fields, ...userSearchKeys)));

export const createUserQueries = (pool: CommonQueryMethods) => {
  const findUserByUsername = async (username: string) =>
    pool.maybeOne<User>(sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      ${
        EnvSet.values.isCaseSensitiveUsername
          ? sql`where ${fields.username}=${username}`
          : sql`where lower(${fields.username})=lower(${username})`
      }
    `);

  const findUserByEmail = async (email: string) =>
    pool.maybeOne<User>(sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where lower(${fields.primaryEmail})=lower(${email})
    `);

  /**
   * Find user by phone with exact match.
   */
  const findUserByPhone = async (phone: string) =>
    pool.maybeOne<User>(sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.primaryPhone}=${phone}
    `);

  /**
   * Find user by phone with normalized match.
   *
   * @remarks
   * In some countries, local phone numbers are often entered with a leading '0'.
   * However, in the international format that includes the country code, this leading '0' should be removed.
   * The previous implementation did not handle this correctly, causing the combination of country code + 0 + local number
   *  to be treated as different from country code + local number in the Logto system.
   * Both formats should be considered the same phone number.
   *
   * To address this, this function will:
   *
   * 1. Normalize the input phone number by separating it into a standard country code and a local number without the leading '0'.
   * 2. Query the user by the phone number both with and without the leading '0'.
   *  If one match is found, return that account. If multiple matches exist (e.g., a user registered two accounts with the same phone number, one with a leading '0' and one without), return the exact match.
   * 3. If the phone number cannot be normalized, attempt to find it with an exact match.
   *
   * @example
   * - DB: 61 0412 345 678
   * - input: 61 412 345 678
   * - return : user with 61 0412 345 678
   *
   * @example
   * - DB: 61 412 345 678
   * - input: 61 0412 345 678
   * - return : user with 61 412 345 678
   *
   * @example
   * - DB: 61 0412 345 678, 61 412 345 678
   * - input: 61 0412 345 678
   * - return : user with 61 0412 345 678
   */
  const findUserByNormalizedPhone = async (phone: string): Promise<Nullable<User>> => {
    const phoneNumberParser = new PhoneNumberParser(phone);

    const { internationalNumber, internationalNumberWithLeadingZero, isValid } = phoneNumberParser;

    // If the phone number is not a valid international phone number, return the user with the exact match.
    if (!isValid || !internationalNumber || !internationalNumberWithLeadingZero) {
      return findUserByPhone(phone);
    }

    const users = await pool.any<User>(sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.primaryPhone}=${internationalNumber}
      or ${fields.primaryPhone}=${internationalNumberWithLeadingZero}
      order by ${fields.createdAt} desc
    `);

    if (users.length === 0) {
      return null;
    }

    // If only one user is found, return that user.
    if (users.length === 1) {
      return users[0] ?? null;
    }

    // Incase user has created two different accounts with the same phone number, one with leading '0' and one without.
    // If more than one user is found, return the user with the exact match.
    // Otherwise, return the first found user, which should be the be the latest one.
    return users.find((user) => user.primaryPhone === phone) ?? users[0] ?? null;
  };

  const findUserById = async (id: string): Promise<User> =>
    pool.one<User>(sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.id}=${id}
    `);

  const findUserByIdentity = async (target: string, userId: string) =>
    pool.maybeOne<User>(
      sql`
        select ${sql.join(Object.values(fields), sql`,`)}
        from ${table}
        where ${fields.identities}::json#>>'{${sql.identifier([target])},userId}' = ${userId}
      `
    );

  const hasUser = async (username: string, excludeUserId?: string) =>
    pool.exists(sql`
      select ${fields.id}
      from ${table}
      ${
        EnvSet.values.isCaseSensitiveUsername
          ? sql`where ${fields.username}=${username}`
          : sql`where lower(${fields.username})=lower(${username})`
      }
      ${conditionalSql(excludeUserId, (id) => sql`and ${fields.id}<>${id}`)}
    `);

  const hasUserWithId = async (id: string) =>
    pool.exists(sql`
      select ${fields.id}
      from ${table}
      where ${fields.id}=${id}
    `);

  const hasUserWithEmail = async (email: string, excludeUserId?: string) =>
    pool.exists(sql`
      select ${fields.primaryEmail}
      from ${table}
      where lower(${fields.primaryEmail})=lower(${email})
      ${conditionalSql(excludeUserId, (id) => sql`and ${fields.id}<>${id}`)}
    `);

  /**
   * Checks if a user exists in the database with an exact match on their phone number.
   */
  const hasUserWithPhone = async (phone: string, excludeUserId?: string) =>
    pool.exists(sql`
      select ${fields.primaryPhone}
      from ${table}
      where ${fields.primaryPhone}=${phone}
      ${conditionalSql(excludeUserId, (id) => sql`and ${fields.id}<>${id}`)}
    `);

  /**
   * Checks if a user exists in the database with a phone number that matches the provided
   * number in either normalized format or with a leading '0'.
   *
   * @remarks
   * This function normalizes the input phone number to account for variations in formatting.
   * It checks for the existence of a user with the same phone number in two formats:
   * - Standard international format (e.g., 61412345678)
   * - International format with a leading '0' before the local number (e.g., 610412345678)
   *
   * If the provided phone number is not a valid international format, it falls back to checking
   * for an exact match using the `hasUserWithPhone` function.
   *
   * @param phone - The phone number to check for user existence.
   * @param excludeUserId - (Optional) If provided, excludes the user with this ID from the search,
   * allowing for updates without false positives.
   *
   * @example
   * // Database contains: 610412345678
   * hasUserWithNormalizedPhone(61412345678); // returns: true
   *
   *  @example
   * // Database contains: 61412345678
   * hasUserWithNormalizedPhone(610412345678); // returns: true
   */
  const hasUserWithNormalizedPhone = async (phone: string, excludeUserId?: string) => {
    const phoneNumberParser = new PhoneNumberParser(phone);

    const { internationalNumber, internationalNumberWithLeadingZero, isValid } = phoneNumberParser;

    // If the phone number is not a valid international phone number, find user with exact match.
    if (!isValid || !internationalNumber || !internationalNumberWithLeadingZero) {
      return hasUserWithPhone(phone, excludeUserId);
    }

    // Check if the user exists with any of the two formats.
    return pool.exists(sql`
      select ${fields.primaryPhone}
      from ${table}
      where (${fields.primaryPhone}=${internationalNumber}
      or ${fields.primaryPhone}=${internationalNumberWithLeadingZero})
      ${conditionalSql(excludeUserId, (id) => sql`and ${fields.id}<>${id}`)}
    `);
  };

  const hasUserWithIdentity = async (target: string, userId: string, excludeUserId?: string) =>
    pool.exists(
      sql`
        select ${fields.id}
        from ${table}
        where ${fields.identities}::json#>>'{${sql.identifier([target])},userId}' = ${userId}
        ${conditionalSql(excludeUserId, (id) => sql`and ${fields.id}<>${id}`)}
      `
    );

  /**
   * Build the `where` clause for finding users with the given conditions joined with `and`.
   *
   * @see {@link UserConditions} for more information about the conditions.
   */
  const buildUserConditions = ({ search, relation }: UserConditions) => {
    const hasSearch = search?.matches.length;
    const id = sql.identifier;
    const buildRelationCondition = () => {
      if (!relation) {
        return;
      }

      const { table, field, type, value } = relation;

      return sql`
        ${type === 'exists' ? sql`exists` : sql`not exists`} (
          select 1
          from ${id([table])}
          where ${id([table, field])} = ${value}
          and ${id([table, 'user_id'])} = ${id([Users.table, Users.fields.id])}
        )
      `;
    };

    const conditions = conditionalArray(
      buildRelationCondition(),
      hasSearch && sql`(${buildConditionsFromSearch(search, userSearchFields)})`
    );

    if (conditions.length === 0) {
      return sql``;
    }

    return sql`where ${sql.join(conditions, sql` and `)}`;
  };

  const countUsers = async (conditions: UserConditions) =>
    pool.one<{ count: number }>(sql`
      select count(*)
      from ${table}
      ${buildUserConditions(conditions)}
    `);

  const findUsers = async (limit: number, offset: number, conditions: UserConditions) =>
    pool.any<User>(
      sql`
        select ${sql.join(
          Object.values(fields).map((field) => sql`${table}.${field}`),
          sql`,`
        )}
        from ${table}
        ${buildUserConditions(conditions)}
        order by ${fields.createdAt} desc
        limit ${limit}
        offset ${offset}
      `
    );

  const findUsersByIds = async (userIds: string[]): Promise<readonly User[]> =>
    userIds.length > 0
      ? pool.any<User>(sql`
        select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        where ${fields.id} in (${sql.join(userIds, sql`, `)})
      `)
      : [];

  const findUserByWebAuthnCredential = async (credentialId: string, rpId?: string) =>
    pool.maybeOne<User>(sql`
      select ${sql.join(
        Object.values(fields).map((field) => sql`${table}.${field}`),
        sql`,`
      )}
      from ${table}
      where ${fields.mfaVerifications}::jsonb @> ${sql.jsonb([
        {
          type: MfaFactor.WebAuthn,
          credentialId,
          ...cond(rpId && { rpId }),
        },
      ])}
      limit 1
    `);

  const updateUser = buildUpdateWhereWithPool(pool)(Users, true);

  const updateUserById = async (
    id: string,
    set: Partial<OmitAutoSetFields<CreateUser>>,
    jsonbMode: 'replace' | 'merge' = 'merge'
  ) => {
    if (set.primaryPhone) {
      validatePhoneNumber(set.primaryPhone);
    }

    return updateUser({
      set: {
        ...set,
        ...cond(
          set.primaryPhone && {
            primaryPhone: new PhoneNumberParser(set.primaryPhone).internationalNumber,
          }
        ),
      },
      where: { id },
      jsonbMode,
    });
  };

  const insertUserQuery = buildInsertIntoWithPool(pool)(Users, {
    returning: true,
  });

  const insertUser = async (data: OmitAutoSetFields<CreateUser>) => {
    if (data.primaryPhone) {
      validatePhoneNumber(data.primaryPhone);
    }

    return insertUserQuery({
      ...data,
      ...cond(
        data.primaryPhone && {
          primaryPhone: new PhoneNumberParser(data.primaryPhone).internationalNumber,
        }
      ),
    });
  };

  const deleteUserById = async (id: string) => {
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.id}=${id}
    `);

    if (rowCount < 1) {
      throw new DeletionError(Users.table, id);
    }
  };

  const deleteUserIdentity = async (userId: string, target: string) =>
    pool.one<User>(sql`
      update ${table}
      set ${fields.identities}=${fields.identities}::jsonb-${target}
      where ${fields.id}=${userId}
      returning *
    `);

  const hasActiveUsers = async () =>
    pool.exists(sql`
      select ${fields.id}
      from ${table}
      where ${fields.isSuspended} = false
      limit 1
    `);

  const getDailyNewUserCountsByTimeInterval = async (
    startTimeExclusive: number,
    endTimeInclusive: number
  ) =>
    pool.any<{ date: string; count: number }>(sql`
      select date(${fields.createdAt}), count(*)
      from ${table}
      where ${fields.createdAt} > to_timestamp(${startTimeExclusive}::double precision / 1000)
      and ${fields.createdAt} <= to_timestamp(${endTimeInclusive}::double precision / 1000)
      group by date(${fields.createdAt})
    `);

  return {
    findUserByUsername,
    findUserByEmail,
    findUserByPhone,
    findUserByNormalizedPhone,
    findUserById,
    findUserByWebAuthnCredential,
    findUserByIdentity,
    hasUser,
    hasUserWithId,
    hasUserWithEmail,
    hasUserWithPhone,
    hasUserWithNormalizedPhone,
    hasUserWithIdentity,
    countUsers,
    findUsers,
    findUsersByIds,
    updateUserById,
    insertUser,
    deleteUserById,
    deleteUserIdentity,
    hasActiveUsers,
    getDailyNewUserCountsByTimeInterval,
  };
};
/* eslint-enable max-lines */
