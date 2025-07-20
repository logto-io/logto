#!/usr/bin/env node

async function enableAccountCenter() {
  try {
    console.log('Enabling Account Center for password change functionality...');
    const tokenResponse = await fetch('http://localhost:3001/oidc/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        resource: 'https://default.logto.app/api',
        scope: 'all',
        client_id: 'mxkxwudv6oasdhfpgr8mq',
        client_secret: 'tv4TqepmGeO8Xp4fFTsZ3UsgwBZNRG4j',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      throw new Error(`Failed to get access token: ${error}`);
    }

    const { access_token } = await tokenResponse.json();
    console.log('✓ Got Management API access token');

    const patchResponse = await fetch('http://localhost:3001/api/account-center', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        enabled: true,
        fields: {
          username: 'Edit',
          email: 'Edit',
          phone: 'Edit',
          password: 'Edit',
          name: 'Edit',
          avatar: 'Edit',
          profile: 'Edit',
          social: 'ReadOnly',
          mfa: 'Edit'
        }
      }),
    });

    if (!patchResponse.ok) {
      const error = await patchResponse.text();
      throw new Error(`Failed to enable account center: ${error}`);
    }

    const result = await patchResponse.json();
    console.log('✓ Account Center enabled successfully!');
    console.log('Account Center settings:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Error enabling account center:', error);
    process.exit(1);
  }
}

enableAccountCenter();