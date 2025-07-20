import type { IdTokenClaims } from '@logto/react';
import type React from 'react';
import { useTranslation } from 'react-i18next';

type UserInfoCardProps = {
  readonly user: Pick<IdTokenClaims, 'sub' | 'username'>;
  readonly decryptedSecret?: string;
};

const UserInfoCard: React.FC<UserInfoCardProps> = ({ user, decryptedSecret }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'demo_app' });

  return (
    <div
      style={{
        textAlign: 'left',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {user.username && (
        <div style={{ textAlign: 'left', marginBottom: '15px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{t('username')}</div>
          <pre
            style={{
              margin: 0,
              padding: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              fontSize: '0.9em',
              fontFamily: 'monospace',
              overflow: 'auto',
              maxWidth: '100%',
              color: 'inherit',
            }}
          >
            {user.username}
          </pre>
        </div>
      )}
      <div style={{ textAlign: 'left', marginBottom: '15px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{t('user_id')}</div>
        <pre
          style={{
            margin: 0,
            padding: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            fontSize: '0.9em',
            fontFamily: 'monospace',
            overflow: 'auto',
            maxWidth: '100%',
            color: 'inherit',
          }}
        >
          {user.sub}
        </pre>
      </div>
      {decryptedSecret && (
        <div style={{ textAlign: 'left', marginBottom: '15px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Zero-Knowledge Secret:</div>
          <pre
            style={{
              margin: 0,
              padding: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              fontSize: '0.9em',
              fontFamily: 'monospace',
              overflow: 'auto',
              maxWidth: '100%',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              color: 'inherit',
            }}
          >
            {decryptedSecret}
          </pre>
        </div>
      )}
      {!decryptedSecret && (
        <div style={{ textAlign: 'left', marginBottom: '15px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Zero-Knowledge Secret:</div>
          <div style={{ fontSize: '0.9em', color: '#666', fontStyle: 'italic' }}>
            Secret retrieval in progress...
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfoCard;
