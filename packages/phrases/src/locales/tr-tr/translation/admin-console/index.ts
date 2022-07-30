import api_resource_details from './api-resource-details';
import api_resources from './api-resources';
import application_details from './application-details';
import applications from './applications';
import connector_details from './connector-details';
import connectors from './connectors';
import contact from './contact';
import dashboard from './dashboard';
import errors from './errors';
import general from './general';
import get_started from './get-started';
import log_details from './log-details';
import logs from './logs';
import session_expired from './session-expired';
import settings from './settings';
import sign_in_exp from './sign-in-exp';
import tab_sections from './tab-sections';
import tabs from './tabs';
import user_details from './user-details';
import users from './users';
import welcome from './welcome';

const admin_console = {
  title: 'Yönetici Paneli',
  sign_out: 'Çıkış Yap',
  profile: 'Profil',
  admin_user: 'Yönetici',
  system_app: 'Sistem',
  general,
  errors,
  tab_sections,
  tabs,
  applications,
  application_details,
  api_resources,
  api_resource_details,
  connectors,
  connector_details,
  get_started,
  users,
  user_details,
  contact,
  sign_in_exp,
  settings,
  dashboard,
  logs,
  log_details,
  session_expired,
  welcome,
};

export default admin_console;
