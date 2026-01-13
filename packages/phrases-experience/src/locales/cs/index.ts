import account_center from './account-center.js';
import action from './action.js';
import description from './description.js';
import development_tenant from './development-tenant.js';
import error from './error/index.js';
import input from './input.js';
import list from './list.js';
import mfa from './mfa.js';
import profile from './profile.js';
import secondary from './secondary.js';
import user_scopes from './user-scopes.js';

const en = {
  translation: {
    vstup,
    druhé,
    akce,
    popis,
    chyba,
    seznam,
    vícefázové_ověření,
    vývojové_prostředí,
    oprávnění_uživatele,
    profil,
    centrum_účtu,
  },
};

export default Object.freeze(en);
