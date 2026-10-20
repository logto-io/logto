import { type Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import { useCallback, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import TextLink from '@/components/TextLink';
import usePlatform from '@/hooks/use-platform';
import useTerms from '@/hooks/use-terms';
import { layoutClassNames } from '@/utils/consts';

import { AICoResearcherLogo } from './AICoResearcherLogo';
import CustomContent from './CustomContent';
import DotPattern from './DotPattern';
import { LayoutAsidePortalContext } from './LayoutAsidePortal';
import MarketingPanel, { type AuthMarketingVariant } from './MarketingPanel';
import ZerveLogo from './MarketingPanel/ZerveLogo';
import styles from './index.module.scss';

const getAuthVariant = (pathname: string): AuthMarketingVariant | undefined => {
  if (pathname === '/register' || pathname.startsWith('/register/')) {
    return 'sign-up';
  }

  if (pathname === '/sign-in' || pathname.startsWith('/sign-in/')) {
    return 'sign-in';
  }
};

const AppLayout = () => {
  const { termsOfUseUrl, privacyPolicyUrl } = useTerms();
  const { isMobile } = usePlatform();

  const [asidePortalContainer, setAsidePortalContainer] = useState<Nullable<HTMLElement>>(null);
  const [activeAsidePortalCount, setActiveAsidePortalCount] = useState(0);

  const register = useCallback(() => {
    setActiveAsidePortalCount((count) => count + 1);
    return () => {
      setActiveAsidePortalCount((count) => count - 1);
    };
  }, []);

  const asidePortalContext = useMemo(
    () => ({ container: asidePortalContainer, register }),
    [asidePortalContainer, register]
  );

  const { pathname } = useLocation();
  const authVariant = getAuthVariant(pathname);

  const isFromAICoResearcher = useMemo(() => {
    try {
      return new URL(document.referrer).hostname === 'research.zerve.ai';
    } catch {
      return false;
    }
  }, []);

  const mainContent = (
    <div className={styles.mainAsideWrapper}>
      <main className={classNames(styles.main, layoutClassNames.mainContent)}>
        <Outlet />
      </main>

      {/* Footer portal slot, only rendered while a page fills it via `LayoutAsidePortal`. */}
      {activeAsidePortalCount > 0 && (
        <aside ref={setAsidePortalContainer} className={styles.aside} />
      )}
    </div>
  );

  return (
    <LayoutAsidePortalContext.Provider value={asidePortalContext}>
      {authVariant ? (
        <div className={classNames(styles.viewBox, styles.brandedView)}>
          <div className={classNames(styles.split, 'zerveAuthShell')}>
            <MarketingPanel
              variant={authVariant}
              termsOfUseUrl={termsOfUseUrl}
              privacyPolicyUrl={privacyPolicyUrl}
            />
            <div
              className={classNames(
                styles.stage,
                authVariant === 'sign-up' ? styles.signUpStage : styles.signInStage
              )}
            >
              <div className={styles.stageLogo}>
                <ZerveLogo />
              </div>
              <div className={styles.stageBody}>{mainContent}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.viewBox}>
          <div className={classNames(styles.container, layoutClassNames.pageContainer)}>
            <DotPattern />

            {!isMobile && <CustomContent className={layoutClassNames.customContent} />}

            <header className={styles.header}>
              {isFromAICoResearcher && (
                <>
                  <AICoResearcherLogo />

                  <span className={styles.poweredByZerve}>
                    Powered by{' '}
                    <img
                      src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAzMiAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI1Ljc5MjcgMi41NTk4M0wyMy4zMDc4IDguOTI1NDhIMjEuNzk4NkwxOS4yMjI2IDIuNTU5ODNIMjAuODg3OUwyMi41NjYyIDcuMTA4NTlMMjQuMjA1NSAyLjU1OTgzSDI1Ljc5MjdaIiBmaWxsPSIjRkJGQkZGIi8+CjxwYXRoIGQ9Ik0xOC4zOTY2IDIuNTIxNzRWNC4wMDcyMkMxOC4yMjg3IDMuOTgyMDUgMTguMDY5MyAzLjk2OTQ2IDE3LjkxODIgMy45Njk0NkMxNi44MTg2IDMuOTY5NDYgMTYuMjY4OCA0LjU2OTUzIDE2LjI2ODggNS43Njk2NlY4LjkyNTk2SDE0LjgwODNWMi41NTk1MUgxNi4yMzFWMy41NDE0NEMxNi4zNzM3IDMuMjE0MTMgMTYuNjA0NSAyLjk1ODE2IDE2LjkyMzUgMi43NzM1MkMxNy4yNDI1IDIuNTgwNDkgMTcuNjAzNCAyLjQ4Mzk4IDE4LjAwNjMgMi40ODM5OEMxOC4xNDA2IDIuNDgzOTggMTguMjcwNyAyLjQ5NjU3IDE4LjM5NjYgMi41MjE3NFoiIGZpbGw9IiNGQkZCRkYiLz4KPHBhdGggZD0iTTguOTc0NDYgNS4wNDg3OEgxMi4wNTIxQzEyLjAzNSA0LjY1MzkzIDExLjg5MzMgNC4zMjM0NiAxMS42MjcyIDQuMDU3MzdDMTEuMzY5NiAzLjc5MTI4IDEwLjk5NjIgMy42NTgyMyAxMC41MDY5IDMuNjU4MjNDMTAuMDYwNCAzLjY1ODIzIDkuNjk5ODggMy43OTk4NiA5LjQyNTE2IDQuMDgzMTJDOS4xNTA0NSA0LjM1NzggOS4wMDAyMiA0LjY3OTY4IDguOTc0NDYgNS4wNDg3OFpNMTIuMDM4MSA3LjA4MzI3TDEzLjQ4MTUgNy4wODMwOUMxMy4zMDEyIDcuNjU4MiAxMi45NjIxIDguMTM0NTkgMTIuNDY0MiA4LjUxMjI2QzExLjk3NDkgOC44ODEzNiAxMS4zNjk2IDkuMDY1OTEgMTAuNjQ4NSA5LjA2NTkxQzkuNzU1NjggOS4wNjU5MSA4Ljk5NTkyIDguNzYxMTkgOC4zNjkyMyA4LjE1MTc1QzcuNzUxMTIgNy41NDIzMiA3LjQ0MjA3IDYuNzI2ODcgNy40NDIwNyA1LjcwNTQyQzcuNDQyMDcgNC43NDQwNiA3Ljc0MjU0IDMuOTU0MzcgOC4zNDM0OCAzLjMzNjM1QzguOTUzIDIuNzE4MzMgOS42Njk4MyAyLjQwOTMyIDEwLjQ5NCAyLjQwOTMyQzExLjQ1NTUgMi40MDkzMiAxMi4yMDY2IDIuNzA1NDUgMTIuNzQ3NSAzLjI5NzcyQzEzLjI4ODMgMy44ODE0MSAxMy41NTg4IDQuNjcxMSAxMy41NTg4IDUuNjY2OEMxMy41NTg4IDUuOTQ5NSAxMy41MjAxIDYuMDYyODIgMTMuNTIwMSA2LjA2MjgySDguOTM1ODNDOC45NTMgNi41MzQ5MiA5LjEyNDcgNy4wMDU4NCA5LjQ1MDkyIDcuMzE0ODVDOS43ODU3MyA3LjYyMzg2IDEwLjE4NDkgNy43NzgzNyAxMC42NDg1IDcuNzc4MzdDMTEuMjkxNiA3Ljc3ODM3IDExLjc1NDggNy41NDY2NyAxMi4wMzgxIDcuMDgzMjdaIiBmaWxsPSIjRkJGQkZGIi8+CjxwYXRoIGQ9Ik0yNy4zNzMgNS4wNDg3OEgzMC40NTA3QzMwLjQzMzUgNC42NTM5MyAzMC4yOTE5IDQuMzIzNDYgMzAuMDI1NyA0LjA1NzM3QzI5Ljc2ODIgMy43OTEyOCAyOS4zOTQ4IDMuNjU4MjMgMjguOTA1NCAzLjY1ODIzQzI4LjQ1OSAzLjY1ODIzIDI4LjA5ODQgMy43OTk4NiAyNy44MjM3IDQuMDgzMTJDMjcuNTQ5IDQuMzU3OCAyNy4zOTg4IDQuNjc5NjggMjcuMzczIDUuMDQ4NzhaTTMwLjQzNjYgNy4wODMyN0wzMS44ODAxIDcuMDgzMDlDMzEuNjk5OCA3LjY1ODIgMzEuMzYwNyA4LjEzNDU5IDMwLjg2MjggOC41MTIyNkMzMC4zNzM0IDguODgxMzYgMjkuNzY4MiA5LjA2NTkxIDI5LjA0NzEgOS4wNjU5MUMyOC4xNTQyIDkuMDY1OTEgMjcuMzk0NSA4Ljc2MTE5IDI2Ljc2NzggOC4xNTE3NUMyNi4xNDk3IDcuNTQyMzIgMjUuODQwNiA2LjcyNjg3IDI1Ljg0MDYgNS43MDU0MkMyNS44NDA2IDQuNzQ0MDYgMjYuMTQxMSAzLjk1NDM3IDI2Ljc0MiAzLjMzNjM1QzI3LjM1MTYgMi43MTgzMyAyOC4wNjg0IDIuNDA5MzIgMjguODkyNSAyLjQwOTMyQzI5Ljg1NCAyLjQwOTMyIDMwLjYwNTIgMi43MDU0NSAzMS4xNDYxIDMuMjk3NzJDMzEuNjg2OSAzLjg4MTQxIDMxLjk1NzMgNC42NzExIDMxLjk1NzMgNS42NjY4QzMxLjk1NzMgNS45NDk1IDMxLjkxODcgNi4wNjI4MiAzMS45MTg3IDYuMDYyODJIMjcuMzM0NEMyNy4zNTE2IDYuNTM0OTIgMjcuNTIzMyA3LjAwNTg0IDI3Ljg0OTUgNy4zMTQ4NUMyOC4xODQzIDcuNjIzODYgMjguNTgzNSA3Ljc3ODM3IDI5LjA0NzEgNy43NzgzN0MyOS42OTAyIDcuNzc4MzcgMzAuMTUzNCA3LjU0NjY3IDMwLjQzNjYgNy4wODMyN1oiIGZpbGw9IiNGQkZCRkYiLz4KPHBhdGggZD0iTTYuOTYzMTYgOC45MjU0N0gwLjAwMDU1Mjk3NFY3LjQ5MDM1TDQuOTQ4NjYgMS40MjI1NEgwVjBINi45NjEwM1YxLjQxNDdMMS44ODkxNCA3LjQ5MDM1SDYuOTYzMTZWOC45MjU0N1oiIGZpbGw9IiNGQkZCRkYiLz4KPC9zdmc+Cg=="
                      alt="Zerve"
                    />
                  </span>
                </>
              )}
            </header>

            {mainContent}

            <footer className={styles.footer}>
              {termsOfUseUrl && (
                <TextLink
                  className={styles.link}
                  text="description.terms_of_use"
                  href={termsOfUseUrl}
                  type="secondary"
                  target="_blank"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                />
              )}
              {privacyPolicyUrl && (
                <TextLink
                  className={styles.link}
                  text="description.privacy_policy"
                  href={privacyPolicyUrl}
                  type="secondary"
                  target="_blank"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                />
              )}
            </footer>
          </div>
        </div>
      )}
    </LayoutAsidePortalContext.Provider>
  );
};

export default AppLayout;
