/* eslint-disable complexity */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import FlexBox from '../FlexBox';
import Panel from '../Panel';
import Role from '../Role';
import User from '../User';
import JohnVector from '../Vector/John';
import SarahVector from '../Vector/Sarah';

import * as styles from './index.module.scss';

function InteractiveDiagram() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.organizations' });
  const [activePerson, setActivePerson] = useState<'John' | 'Sarah'>();
  const [activeRole, setActiveRole] = useState<'Admin' | 'Member' | 'Guest'>();

  return (
    <FlexBox type="column" gap={32} style={{ padding: '12px 0' }}>
      <FlexBox style={{ alignItems: 'center' }}>
        <User
          variant="blue"
          name="John"
          tooltip={t('guide.john_tip')}
          isActive={activePerson !== 'Sarah' && !activeRole}
          onMouseOver={() => {
            setActivePerson('John');
          }}
          onMouseOut={() => {
            setActivePerson(undefined);
          }}
        />
        <JohnVector isActive={activePerson !== 'Sarah' && !activeRole} />
        <Panel
          className={styles.panel}
          label={`${t('organization')} A`}
          size="small"
          variant="blue"
        >
          <FlexBox isEquallyDivided gap={10} style={{ marginBottom: '8px' }}>
            <Role
              size="small"
              label={`${t('role')}: Admin`}
              tooltip={t('guide.role_description', { role: 'Admin' })}
              isActive={(activeRole === 'Admin' || !activeRole) && activePerson !== 'Sarah'}
              onMouseOver={() => {
                setActiveRole('Admin');
              }}
              onMouseOut={() => {
                setActiveRole(undefined);
              }}
            />
            <Role
              size="small"
              label={`${t('role')}: Member`}
              tooltip={t('guide.role_description', { role: 'Member' })}
              isActive={(activeRole === 'Member' || !activeRole) && !activePerson}
              onMouseOver={() => {
                setActiveRole('Member');
              }}
              onMouseOut={() => {
                setActiveRole(undefined);
              }}
            />
            <Role
              size="small"
              label={`${t('role')}: Guest`}
              tooltip={t('guide.role_description', { role: 'Guest' })}
              isActive={(activeRole === 'Guest' || !activeRole) && !activePerson}
              onMouseOver={() => {
                setActiveRole('Guest');
              }}
              onMouseOut={() => {
                setActiveRole(undefined);
              }}
            />
            <Role size="small" label="..." isActive={!activeRole && !activePerson} />
          </FlexBox>
          <User
            size="small"
            variant="blue"
            name="John"
            tooltip={t('guide.john_tip')}
            isActive={activePerson !== 'Sarah' && !activeRole}
            onMouseOver={() => {
              setActivePerson('John');
            }}
            onMouseOut={() => {
              setActivePerson(undefined);
            }}
          />
        </Panel>
      </FlexBox>
      <FlexBox style={{ alignItems: 'center' }}>
        <User
          variant="pink"
          name="Sarah"
          tooltip={t('guide.sarah_tip')}
          isActive={activePerson !== 'John' && !activeRole}
          onMouseOver={() => {
            setActivePerson('Sarah');
          }}
          onMouseOut={() => {
            setActivePerson(undefined);
          }}
        />
        <SarahVector isActive={activePerson !== 'John' && !activeRole} />
        <Panel
          className={styles.panel}
          label={`${t('organization')} B`}
          size="small"
          variant="purple"
        >
          <FlexBox isEquallyDivided gap={10} style={{ marginBottom: '8px' }}>
            <Role
              size="small"
              label={`${t('role')}: Admin`}
              tooltip={t('guide.role_description', { role: 'Admin' })}
              isActive={(activeRole === 'Admin' || !activeRole) && activePerson !== 'John'}
              onMouseOver={() => {
                setActiveRole('Admin');
              }}
              onMouseOut={() => {
                setActiveRole(undefined);
              }}
            />
            <Role
              size="small"
              label={`${t('role')}: Member`}
              tooltip={t('guide.role_description', { role: 'Member' })}
              isActive={(activeRole === 'Member' || !activeRole) && !activePerson}
              onMouseOver={() => {
                setActiveRole('Member');
              }}
              onMouseOut={() => {
                setActiveRole(undefined);
              }}
            />
            <Role
              size="small"
              label={`${t('role')}: Guest`}
              tooltip={t('guide.role_description', { role: 'Guest' })}
              isActive={(activeRole === 'Guest' || !activeRole) && activePerson !== 'Sarah'}
              onMouseOver={() => {
                setActiveRole('Guest');
              }}
              onMouseOut={() => {
                setActiveRole(undefined);
              }}
            />
            <Role size="small" label="..." isActive={!activeRole && !activePerson} />
          </FlexBox>
          <FlexBox isEquallyDivided gap={10}>
            <div>
              <User
                variant="pink"
                name="Sarah"
                size="small"
                tooltip={t('guide.sarah_tip')}
                isActive={activePerson !== 'John' && !activeRole}
                onMouseOver={() => {
                  setActivePerson('Sarah');
                }}
                onMouseOut={() => {
                  setActivePerson(undefined);
                }}
              />
            </div>
            <div>
              <User
                variant="blue"
                name="John"
                size="small"
                tooltip={t('guide.john_tip')}
                isActive={activePerson !== 'Sarah' && !activeRole}
                onMouseOver={() => {
                  setActivePerson('John');
                }}
                onMouseOut={() => {
                  setActivePerson(undefined);
                }}
              />
            </div>
          </FlexBox>
        </Panel>
      </FlexBox>
    </FlexBox>
  );
}

export default InteractiveDiagram;
/* eslint-enable complexity */
