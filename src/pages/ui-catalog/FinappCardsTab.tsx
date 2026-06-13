import { AppIcon } from '../../components/icons/AppIcon';
import { FinappCapsule, Section } from './CatalogPrimitives';

function WalletCardBlock({
  tintClass,
  balance,
}: {
  tintClass: string;
  balance: string;
}) {
  return (
    <div className={`card-block mb-2 ${tintClass}`}>
      <div className="card-main">
        <div className="card-button dropdown">
          <button type="button" className="btn btn-link btn-icon" aria-label="Card menu">
            <AppIcon icon="lucide:ellipsis" className="h-5 w-5 text-white" />
          </button>
        </div>
        <div className="balance">
          <span className="label">BALANCE</span>
          <h1 className="title">{balance}</h1>
        </div>
        <div className="in">
          <div className="card-number">
            <span className="label">Card Number</span>
            •••• 9905
          </div>
          <div className="bottom">
            <div className="card-expiry">
              <span className="label">Expiry</span>
              12 / 25
            </div>
            <div className="card-ccv">
              <span className="label">CCV</span>
              553
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FinappCardsTab() {
  return (
    <FinappCapsule>
      <Section title="Wallet card (dashboard)" source="index.html" subtitle="Total balance + quick actions.">
        <div className="section wallet-card-section pt-1">
          <div className="wallet-card">
            <div className="balance">
              <div className="left">
                <span className="title">Total Balance</span>
                <h1 className="total">$ 2,562.50</h1>
              </div>
              <div className="right">
                <button type="button" className="button" aria-label="Add balance">
                  +
                </button>
              </div>
            </div>
            <div className="wallet-footer">
              <div className="item">
                <a href="#catalog" onClick={(e) => e.preventDefault()}>
                  <div className="icon-wrapper bg-danger">↓</div>
                  <strong>Withdraw</strong>
                </a>
              </div>
              <div className="item">
                <a href="#catalog" onClick={(e) => e.preventDefault()}>
                  <div className="icon-wrapper">→</div>
                  <strong>Send</strong>
                </a>
              </div>
              <div className="item">
                <a href="#catalog" onClick={(e) => e.preventDefault()}>
                  <div className="icon-wrapper bg-success">▣</div>
                  <strong>Cards</strong>
                </a>
              </div>
              <div className="item">
                <a href="#catalog" onClick={(e) => e.preventDefault()}>
                  <div className="icon-wrapper bg-warning">⇅</div>
                  <strong>Exchange</strong>
                </a>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Stat boxes" source="index.html">
        <div className="section">
          <div className="row mt-2">
            <div className="col-6">
              <div className="stat-box">
                <div className="title">Income</div>
                <div className="value text-success">$ 552.95</div>
              </div>
            </div>
            <div className="col-6">
              <div className="stat-box">
                <div className="title">Expenses</div>
                <div className="value text-danger">$ 86.45</div>
              </div>
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-6">
              <div className="stat-box">
                <div className="title">Total Bills</div>
                <div className="value">$ 53.25</div>
              </div>
            </div>
            <div className="col-6">
              <div className="stat-box">
                <div className="title">Savings</div>
                <div className="value">$ 120.99</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Bank card blocks" source="app-cards.html">
        <div className="section mt-2">
          <WalletCardBlock tintClass="" balance="$ 1,256.90" />
          <WalletCardBlock tintClass="bg-secondary" balance="$ 521.44" />
          <WalletCardBlock tintClass="bg-success" balance="$ 52.60" />
          <WalletCardBlock tintClass="bg-danger" balance="$ 12.00" />
        </div>
      </Section>

      <Section title="Bootstrap cards" source="component-card.html">
        <div className="section mt-2">
          <div className="card">
            <div className="card-body">This is some text within a card body.</div>
          </div>
        </div>
        <div className="section mt-2">
          <div className="card">
            <div className="card-header">Card Header</div>
            <div className="card-body">
              <h5 className="card-title">Title</h5>
              <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>
              <button type="button" className="btn btn-primary">
                Go somewhere
              </button>
            </div>
            <div className="card-footer">This is card footer</div>
          </div>
        </div>
        <div className="section mt-2">
          <div className="card text-white bg-primary mb-2">
            <div className="card-header">Header</div>
            <div className="card-body">
              <h5 className="card-title">Primary card</h5>
              <p className="card-text">Colored card variant from Finapp template.</p>
            </div>
          </div>
          <div className="card text-white bg-success mb-2">
            <div className="card-header">Header</div>
            <div className="card-body">
              <h5 className="card-title">Success card</h5>
            </div>
          </div>
        </div>
        <div className="section mt-2">
          <div className="card bg-dark text-white">
            <div
              className="card-img overlay-img"
              style={{
                background: 'linear-gradient(135deg, #6236ff 0%, #4E87FF 100%)',
                minHeight: 120,
              }}
            />
            <div className="card-img-overlay">
              <h5 className="card-title">Overlay card</h5>
              <p className="card-text">Dark overlay with image gradient placeholder.</p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="E.ONE bank cards" source="finapp-bank-cards.css (project)">
        <div className="finapp-bank-cards section max-w-sm">
          <div className="card-block bg-warning" style={{ height: 160 }}>
            <div className="card-main">
              <div className="card-footer-row">
                <div className="in">
                  <span className="label">REALM</span>
                  <div className="card-number">•••• 4412</div>
                </div>
                <button type="button" className="card-buy-btn">
                  BUY
                </button>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </FinappCapsule>
  );
}
