import Router from 'koa-router';
import { object, string } from 'zod';
import { encryptPassword } from '@/utils/password';
import { hasUser, hasUserWithId, insertUser } from '@/queries/user';
import { nanoid } from 'nanoid';
import { PasswordEncryptionMethod } from '@logto/schemas';
import koaGuard from '@/middleware/koa-guard';
import RequestError from '@/errors/RequestError';
import { buildIdGenerator } from '@/utils/id';

const userId = buildIdGenerator(12);

const generateUserId = async (maxRetries = 500) => {
  for (let i = 0; i < maxRetries; ++i) {
    const id = userId();
    // eslint-disable-next-line no-await-in-loop
    if (!(await hasUserWithId(id))) {
      return id;
    }
  }

  throw new Error('Cannot generate user ID in reasonable retries');
};

export default function userRoutes(router: Router) {
  router.post(
    '/user',
    koaGuard({
      body: object({
        username: string().min(3),
        password: string().min(6),
      }),
    }),
    async (ctx, next) => {
      const { username, password } = ctx.guard.body;

      if (await hasUser(username)) {
        throw new RequestError('user.username_exists');
      }

      const id = await generateUserId();
      const passwordEncryptionSalt = nanoid();
      const passwordEncryptionMethod = PasswordEncryptionMethod.SaltAndPepper;
      const passwordEncrypted = encryptPassword(
        id,
        password,
        passwordEncryptionSalt,
        passwordEncryptionMethod
      );

      ctx.body = await insertUser({
        id,
        username,
        passwordEncrypted,
        passwordEncryptionMethod,
        passwordEncryptionSalt,
      });
      return next();
    }
  );
}
