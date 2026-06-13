import { AppIcon } from '../../components/icons/AppIcon';
import { useState } from 'react';
import {
  ACTION_SHEET_MENU_ICONS,
  ActionButtonList,
  AlertActionSheetContent,
  BottomMenuPreview,
  CatalogTriggerList,
  DepositFormFields,
  FinappSidebarBody,
} from './catalogHelpers';
import { AvatarPlaceholder, CatalogModal, FinappCapsule, Section } from './CatalogPrimitives';
import { FinappSplideCarousel } from './FinappCarousel';

type SheetKey =
  | 'default'
  | 'inset'
  | 'iconed'
  | 'form'
  | 'content'
  | 'alertFingerprint'
  | 'alertSuccess'
  | 'alertError'
  | 'alertImaged';

export function FinappMenusTab() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panelLeftOpen, setPanelLeftOpen] = useState(false);
  const [panelRightOpen, setPanelRightOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<SheetKey | null>(null);
  const [cookiesOpen, setCookiesOpen] = useState(false);
  const [addToHomeOpen, setAddToHomeOpen] = useState(false);

  const closeSheet = () => setActiveSheet(null);

  const standardActions = [
    { label: 'Send', icon: ACTION_SHEET_MENU_ICONS.send },
    { label: 'Withdraw', icon: ACTION_SHEET_MENU_ICONS.withdraw },
    { label: 'Exchange', icon: ACTION_SHEET_MENU_ICONS.exchange },
    { label: 'Deposit', icon: ACTION_SHEET_MENU_ICONS.deposit },
  ];

  const sheetTriggers: { label: string; key: SheetKey }[] = [
    { label: 'Default', key: 'default' },
    { label: 'Inset', key: 'inset' },
    { label: 'Iconed', key: 'iconed' },
    { label: 'With form', key: 'form' },
    { label: 'Content', key: 'content' },
    { label: 'Alert — Touch ID', key: 'alertFingerprint' },
    { label: 'Alert — Success', key: 'alertSuccess' },
    { label: 'Alert — Error', key: 'alertError' },
    { label: 'Alert — Imaged', key: 'alertImaged' },
  ];

  const renderSheetBody = () => {
    if (!activeSheet) return null;

    if (activeSheet === 'form') {
      return (
        <div className="action-sheet-content">
          <DepositFormFields onSubmit={closeSheet} />
        </div>
      );
    }

    if (activeSheet === 'content') {
      return (
        <div className="action-sheet-content">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc fermentum, urna eget finibus fermentum, velit
            metus maximus erat, nec sodales elit justo vitae sapien.
          </p>
          <button type="button" className="btn btn-primary btn-lg btn-block" onClick={closeSheet}>
            Close
          </button>
        </div>
      );
    }

    if (activeSheet === 'alertFingerprint') {
      return (
        <AlertActionSheetContent
          tone="primary"
          title="Touch ID Required"
          message="Your payment has been sent to John."
          icon={ACTION_SHEET_MENU_ICONS.fingerprint}
          onDone={closeSheet}
        />
      );
    }

    if (activeSheet === 'alertSuccess') {
      return (
        <AlertActionSheetContent
          tone="success"
          title="Success"
          message="Your payment has been sent to John."
          icon={<span className="text-4xl">✓</span>}
          onDone={closeSheet}
        />
      );
    }

    if (activeSheet === 'alertError') {
      return (
        <AlertActionSheetContent
          tone="danger"
          title="Error"
          message="Something went wrong."
          icon={<AppIcon icon="lucide:x" className="h-10 w-10" />}
          onDone={closeSheet}
        />
      );
    }

    if (activeSheet === 'alertImaged') {
      return (
        <div className="action-sheet-content">
          <div className="iconbox">
            <AvatarPlaceholder label="JN" tone="rose" />
          </div>
          <div className="text-center p-2">
            <h3>Jane sent you $200</h3>
            <p>This is example text.</p>
          </div>
          <button type="button" className="btn btn-primary btn-lg btn-block" onClick={closeSheet}>
            Done
          </button>
        </div>
      );
    }

    const iconed = activeSheet === 'iconed';
    return (
      <ActionButtonList
        actions={standardActions.map((a) => ({
          ...a,
          icon: iconed ? a.icon : undefined,
        }))}
        onClose={closeSheet}
      />
    );
  };

  const sheetModalClass =
    activeSheet === 'inset'
      ? 'action-sheet inset'
      : activeSheet?.startsWith('alert')
        ? 'action-sheet'
        : 'action-sheet';

  const sheetHasHeader = activeSheet && !activeSheet.startsWith('alert');

  return (
    <FinappCapsule>
      <Section title="App header" source="component-appheader.html · index.html">
        <div className="appHeader bg-primary text-light rounded-t-2xl">
          <div className="left">
            <button type="button" className="headerButton" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
              <AppIcon icon="lucide:menu" className="h-6 w-6" strokeWidth={1.75} />
            </button>
          </div>
          <div className="pageTitle">
            <span className="font-bold tracking-tight">Finapp</span>
          </div>
          <div className="right">
            <button type="button" className="headerButton relative" aria-label="Notifications">
              <AppIcon icon="lucide:activity" className="h-6 w-6" />
              <span className="badge badge-danger">4</span>
            </button>
          </div>
        </div>
      </Section>

      <Section title="Bottom menu variants" source="component-appbottommenu.html">
        <div className="section full mt-2">
          <div className="section-title">Default</div>
          <BottomMenuPreview
            items={[
              { icon: 'lucide:chart-pie', label: 'Overview', active: true },
              { icon: 'lucide:file-text', label: 'Pages' },
              { icon: 'lucide:layout-grid', label: 'Components' },
              { icon: 'lucide:credit-card', label: 'My Cards' },
              { icon: 'lucide:settings', label: 'Settings' },
            ]}
          />
        </div>

        <div className="section full mt-4">
          <div className="section-title">Icon only</div>
          <BottomMenuPreview
            items={[
              { icon: 'lucide:activity', active: true },
              { icon: 'lucide:credit-card' },
              { icon: 'lucide:wallet' },
              { icon: 'lucide:calendar' },
              { icon: 'lucide:settings' },
            ]}
          />
        </div>

        <div className="section full mt-4">
          <div className="section-title">With badges</div>
          <BottomMenuPreview
            items={[
              { icon: 'lucide:wallet', label: 'Item 1', badge: '6', badgeClass: 'badge-primary' },
              { icon: 'lucide:credit-card', label: 'Item 2', badge: '52', badgeClass: 'badge-success' },
              { icon: 'lucide:qr-code', active: true, centerAction: true },
              { icon: 'lucide:calendar', label: 'Item 4', badge: '8', badgeClass: 'badge-warning' },
              { icon: 'lucide:settings', label: 'Item 5' },
            ]}
          />
        </div>

        <div className="section full mt-4">
          <div className="section-title">Action button</div>
          <BottomMenuPreview
            items={[
              { icon: 'lucide:activity', label: 'Item 1', active: true },
              { icon: 'lucide:credit-card', label: 'Item 2' },
              { icon: 'lucide:arrow-up', centerAction: true },
              { icon: 'lucide:calendar', label: 'Item 4' },
              { icon: 'lucide:settings', label: 'Item 5' },
            ]}
          />
        </div>

        <div className="section full mt-4">
          <div className="section-title">Action button large</div>
          <BottomMenuPreview
            items={[
              { icon: 'lucide:activity', label: 'Item 1', active: true },
              { icon: 'lucide:credit-card', label: 'Item 2' },
              { icon: 'lucide:arrow-up', centerAction: true, largeAction: true },
              { icon: 'lucide:calendar', label: 'Item 4' },
              { icon: 'lucide:settings', label: 'Item 5' },
            ]}
          />
        </div>

        <div className="section full mt-4">
          <div className="section-title">No border</div>
          <BottomMenuPreview
            className="no-border"
            items={[
              { icon: 'lucide:activity', label: 'Item 1', active: true },
              { icon: 'lucide:credit-card', label: 'Item 2' },
              { icon: 'lucide:banknote', label: 'Item 3' },
              { icon: 'lucide:calendar', label: 'Item 4' },
              { icon: 'lucide:settings', label: 'Item 5' },
            ]}
          />
        </div>

        {(['bg-primary text-light', 'bg-secondary text-light', 'bg-success text-light', 'bg-danger text-light'] as const).map(
          (bg) => (
            <div key={bg} className="section full mt-4">
              <div className="section-title">{bg.replace('bg-', '').split(' ')[0]}</div>
              <BottomMenuPreview
                className={bg}
                items={[
                  { icon: 'lucide:activity', label: 'Item 1', active: true },
                  { icon: 'lucide:credit-card', label: 'Item 2' },
                  { icon: 'lucide:banknote', label: 'Item 3' },
                  { icon: 'lucide:calendar', label: 'Item 4' },
                  { icon: 'lucide:settings', label: 'Item 5' },
                ]}
              />
            </div>
          ),
        )}
      </Section>

      <Section title="Action sheets" source="component-action-sheet.html" subtitle="Tap each row to open the live sheet.">
        <div className="section mt-2">
          <div className="section-title">Basic</div>
          <div className="card">
            <CatalogTriggerList items={sheetTriggers.slice(0, 3).map((t) => ({ label: t.label, onClick: () => setActiveSheet(t.key) }))} />
          </div>
        </div>
        <div className="section mt-2 mb-2">
          <div className="section-title">More</div>
          <div className="card">
            <CatalogTriggerList items={sheetTriggers.slice(3).map((t) => ({ label: t.label, onClick: () => setActiveSheet(t.key) }))} />
          </div>
        </div>
      </Section>

      <Section title="Carousel (Splide structure)" source="component-carousel.html · index.html">
        <div className="section full mt-2 mb-3">
          <div className="section-title">Full carousel</div>
          <FinappSplideCarousel
            variant="carousel-full"
            slides={[
              <div key="1" className="card rounded-0">
                <div className="card-body">
                  <h5 className="card-title">Swipe me</h5>
                  <p className="card-text">Full-width card slide from component-carousel.html</p>
                </div>
              </div>,
              <div key="2" className="card rounded-0">
                <div className="card-body">
                  <h5 className="card-title">Another Card Title</h5>
                  <p className="card-text">Second slide — use arrows below to navigate.</p>
                </div>
              </div>,
              <div key="3" className="card rounded-0">
                <div className="card-body">
                  <h5 className="card-title">Another one</h5>
                  <p className="card-text">Third slide in the Splide list markup.</p>
                </div>
              </div>,
            ]}
          />
        </div>

        <div className="section full mb-3">
          <div className="section-title">Single carousel</div>
          <FinappSplideCarousel
            variant="carousel-single"
            slides={[
              <div key="1" className="card">
                <div className="card-img-top h-32 bg-gradient-to-br from-violet-400 to-blue-400" />
                <div className="card-body">
                  <h5 className="card-title">Carousel Item</h5>
                  <p className="card-text">Image + body card pattern.</p>
                </div>
              </div>,
              <div key="2" className="card">
                <div className="card-img-top h-32 bg-gradient-to-br from-pink-400 to-orange-300" />
                <div className="card-body">
                  <h5 className="card-title">Item Title</h5>
                  <p className="card-text">Second promotional slide.</p>
                </div>
              </div>,
            ]}
          />
        </div>

        <div className="section full mb-3">
          <div className="section-title">Multiple carousel</div>
          <FinappSplideCarousel
            variant="carousel-multiple"
            slideWidthPercent={78}
            slides={[1, 2, 3, 4].map((n) => (
              <div key={n} className="card">
                <div className="card-body">
                  <h5 className="card-title">Title {n}</h5>
                  <p className="card-text">Peek next slide — carousel-multiple.</p>
                </div>
              </div>
            ))}
          />
        </div>

        <div className="section full mb-3">
          <div className="section-title">Small carousel</div>
          <FinappSplideCarousel
            variant="carousel-small"
            slides={[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="imaged w-100 flex h-24 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-300 to-purple-400 text-white"
              >
                Photo {n}
              </div>
            ))}
          />
        </div>
      </Section>

      <Section title="Panels & offcanvas" source="component-modal-and-panels.html · index.html">
        <div className="section mt-2">
          <div className="card">
            <CatalogTriggerList
              items={[
                { label: 'Sidebar (left panel) — index.html', onClick: () => setSidebarOpen(true) },
                { label: 'Left panel — modal-and-panels', onClick: () => setPanelLeftOpen(true) },
                { label: 'Right panel', onClick: () => setPanelRightOpen(true) },
                { label: 'Cookies offcanvas (bottom)', onClick: () => setCookiesOpen(true) },
                { label: 'Add to Home (inset action sheet)', onClick: () => setAddToHomeOpen(true) },
              ]}
            />
          </div>
        </div>
      </Section>

      {/* Action sheets */}
      <CatalogModal open={activeSheet !== null} onClose={closeSheet} modalClassName={sheetModalClass}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            {sheetHasHeader ? (
              <div className="modal-header">
                <h5 className="modal-title">
                  {activeSheet === 'form'
                    ? 'Deposit Money'
                    : activeSheet === 'content'
                      ? 'Action Sheet Content'
                      : 'Action Sheet Title'}
                </h5>
              </div>
            ) : null}
            <div className="modal-body">{renderSheetBody()}</div>
          </div>
        </div>
      </CatalogModal>

      <CatalogModal open={sidebarOpen} onClose={() => setSidebarOpen(false)} modalClassName="panelbox panelbox-left">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <FinappSidebarBody onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      </CatalogModal>

      <CatalogModal open={panelLeftOpen} onClose={() => setPanelLeftOpen(false)} modalClassName="panelbox panelbox-left">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Left Panel Title</h5>
              <button type="button" className="btn btn-link p-0" onClick={() => setPanelLeftOpen(false)}>
                Close
              </button>
            </div>
            <div className="modal-body">Panel body — component-modal-and-panels.html</div>
          </div>
        </div>
      </CatalogModal>

      <CatalogModal open={panelRightOpen} onClose={() => setPanelRightOpen(false)} modalClassName="panelbox panelbox-right">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Right Panel Title</h5>
              <button type="button" className="btn btn-link p-0" onClick={() => setPanelRightOpen(false)}>
                Close
              </button>
            </div>
            <div className="modal-body">Panel body</div>
          </div>
        </div>
      </CatalogModal>

      <CatalogModal open={addToHomeOpen} onClose={() => setAddToHomeOpen(false)} modalClassName="inset action-sheet ios-add-to-home">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add to Home Screen</h5>
              <button type="button" className="close-button btn btn-link p-0" onClick={() => setAddToHomeOpen(false)} aria-label="Close">
                <AppIcon icon="lucide:x" className="h-6 w-6" />
              </button>
            </div>
            <div className="modal-body">
              <div className="action-sheet-content text-center">
                <div className="mb-1 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-pink/20 text-2xl font-bold text-brand-pink">
                  F
                </div>
                <div>
                  Install <strong>Finapp</strong> on your iPhone&apos;s home screen.
                </div>
                <div className="mt-2 inline-flex items-center justify-center gap-1">
                  Tap <AppIcon icon="lucide:share-2" className="h-5 w-5" /> and Add to homescreen.
                </div>
                <div className="mt-2">
                  <button type="button" className="btn btn-primary btn-block" onClick={() => setAddToHomeOpen(false)}>
                    CLOSE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CatalogModal>

      {cookiesOpen ? (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 2980 }} onClick={() => setCookiesOpen(false)} role="presentation" />
          <div className="offcanvas offcanvas-bottom cookies-box show" style={{ visibility: 'visible', zIndex: 2990 }} tabIndex={-1}>
            <div className="offcanvas-header">
              <h5 className="offcanvas-title">We use cookies</h5>
            </div>
            <div className="offcanvas-body">
              <div>
                Lorem ipsum dolor sit amet.{' '}
                <a href="#catalog" className="text-secondary" onClick={(e) => e.preventDefault()}>
                  <u>Learn more</u>
                </a>
              </div>
              <div className="buttons mt-2">
                <button type="button" className="btn btn-primary" onClick={() => setCookiesOpen(false)}>
                  Accept
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </FinappCapsule>
  );
}
