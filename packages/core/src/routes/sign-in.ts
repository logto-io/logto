import assert from 'assert';
import Router from 'koa-router';
import koaBody from 'koa-body';
import { object, string } from 'zod';
import { encryptPassword } from '@/utils/password';
import { findUserById } from '@/queries/user';

export default function createSignInRoutes() {
  const router = new Router();

  router.post('/sign-in', koaBody(), async (ctx) => {
    const SignInBody = object({
      id: string().min(1),
      password: string().min(1),
    });
    const { id, password } = SignInBody.parse(ctx.request.body);
    const { passwordEncrypted, passwordEncryptionMethod, passwordEncryptionSalt } =
      await findUserById(id);

    assert(passwordEncrypted && passwordEncryptionMethod && passwordEncryptionSalt);
    assert(
      encryptPassword(id, password, passwordEncryptionSalt, passwordEncryptionMethod) ===
        passwordEncrypted
    );

    ctx.status = 204;
  });

  return router.routes();
}
