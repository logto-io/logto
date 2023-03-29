import api_resource_details from './api-resource-details.js';
import api_resources from './api-resources.js';
import application_details from './application-details.js';
import applications from './applications.js';
import cloud from './cloud.js';
import components from './components.js';
import connector_details from './connector-details.js';
import connectors from './connectors.js';
import contact from './contact.js';
import dashboard from './dashboard.js';
import errors from './errors.js';
import general from './general.js';
import get_started from './get-started.js';
import log_details from './log-details.js';
import logs from './logs.js';
import menu from './menu.js';
import permissions from './permissions.js';
import profile from './profile.js';
import role_details from './role-details.js';
import roles from './roles.js';
import session_expired from './session-expired.js';
import sign_in_exp from './sign-in-exp/index.js';
import tab_sections from './tab-sections.js';
import tabs from './tabs.js';
import user_details from './user-details.js';
import users from './users.js';
import welcome from './welcome.js';

const admin_console = {
  title: 'Admin Konsole',
  admin_user: 'Admin',
  system_app: 'System',
  menu,
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
  dashboard,
  logs,
  log_details,
  session_expired,
  welcome,
  roles,
  role_details,
  permissions,
  cloud,
  profile,
  components,
};

export default admin_console;
