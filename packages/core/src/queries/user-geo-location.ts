import { UserGeoLocations, type UserGeoLocation as UserGeoLocationEntity } from '@logto/schemas';
import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(UserGeoLocations);

export const createUserGeoLocationQueries = (pool: CommonQueryMethods) => {
  const findUserGeoLocationByUserId = async (userId: string) =>
    pool.maybeOne<UserGeoLocationEntity>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.userId} = ${userId}
    `);

  const upsertUserGeoLocation = async (userId: string, latitude?: number, longitude?: number) => {
    const hasLatitude = latitude !== undefined;
    const hasLongitude = longitude !== undefined;
    const shouldUpdateCoordinates = hasLatitude && hasLongitude;
    const normalizedLatitude = shouldUpdateCoordinates ? latitude : null;
    const normalizedLongitude = shouldUpdateCoordinates ? longitude : null;

    return pool.one<UserGeoLocationEntity>(sql`
      insert into ${table} (
        ${fields.userId},
        ${fields.latitude},
        ${fields.longitude},
        ${fields.updatedAt}
      )
      values (${userId}, ${normalizedLatitude}, ${normalizedLongitude}, now())
      on conflict (${fields.tenantId}, ${fields.userId})
      do update set
        ${fields.latitude} = coalesce(excluded.${fields.latitude}, ${table}.${fields.latitude}),
        ${fields.longitude} = coalesce(excluded.${fields.longitude}, ${table}.${fields.longitude}),
        ${fields.updatedAt} = now()
      returning ${sql.join(Object.values(fields), sql`, `)}
    `);
  };

  return {
    findUserGeoLocationByUserId,
    upsertUserGeoLocation,
  };
};
