import { PasswordEncryptionMethod } from '@logto/schemas';
import { nanoid } from 'nanoid';
import { object, string } from 'zod';

import RequestError from '@/errors/RequestError';
import { generateUserId } from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import { hasUser, insertUser } from '@/queries/user';
import { encryptPassword } from '@/utils/password';

import { AnonymousRouter } from './types';

export default function userRoutes<T extends AnonymousRouter>(router: T) {
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
