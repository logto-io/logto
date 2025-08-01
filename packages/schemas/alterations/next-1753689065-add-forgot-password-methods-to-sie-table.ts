import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences
        add column forgot_password_methods jsonb not null default '[]'::jsonb;
    `);

    // Populate the field based on existing active connectors for each tenant
    await pool.query(sql`
      update sign_in_experiences
      set forgot_password_methods = coalesce(
        (
          select jsonb_agg(method)
          from (
            select case 
              when exists (
                select 1 from connectors 
                where tenant_id = sign_in_experiences.tenant_id 
                and (
                  connector_id = 'sendgrid-email-service' 
                  or connector_id = 'simple-mail-transfer-protocol' 
                  or connector_id = 'aws-ses-mail'
                  or connector_id = 'mailgun-email'
                  or connector_id = 'postmark-mail'
                  or connector_id = 'logto-email'
                  or connector_id = 'mock-email-service'
                  or connector_id = 'mock-email-service-alternative'
                  or connector_id = 'http-email'
                )
              ) then 'EmailVerificationCode'
              else null
            end as method
            union all
            select case 
              when exists (
                select 1 from connectors 
                where tenant_id = sign_in_experiences.tenant_id 
                and (
                  connector_id = 'aliyun-short-message-service' 
                  or connector_id = 'twilio-short-message-service'
                  or connector_id = 'yunpian-sms'
                  or connector_id = 'gatewayapi-sms'
                  or connector_id = 'tencent-short-message-service'
                  or connector_id = 'vonage-sms'
                  or connector_id = 'logto-sms'
                  or connector_id = 'mock-short-message-service'
                )
              ) then 'PhoneVerificationCode'
              else null
            end as method
          ) as methods
          where method is not null
        ),
        '[]'::jsonb
      );
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences
        drop column forgot_password_methods;
    `);
  },
};

export default alteration;
