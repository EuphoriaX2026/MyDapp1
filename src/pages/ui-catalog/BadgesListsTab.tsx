import { AppIcon } from '../../components/icons/AppIcon';
import { AvatarPlaceholder, FinappCapsule, Section } from './CatalogPrimitives';

export function BadgesListsTab() {
  return (
    <FinappCapsule>
      <Section title="Badges" source="component-badge.html" subtitle="Solid, empty, and listview usage.">
        <div className="section mt-2">
          <div className="card">
            <div className="card-body">
              <span className="badge badge-primary">Primary</span>
              <span className="badge badge-secondary ms-1">Secondary</span>
              <span className="badge badge-success ms-1">Success</span>
              <div className="mb-05" />
              <span className="badge badge-danger">Danger</span>
              <span className="badge badge-warning ms-1">Warning</span>
              <span className="badge badge-info ms-1">Info</span>
              <div className="mb-05" />
              <span className="badge badge-light">Light</span>
              <span className="badge badge-dark ms-1">Dark</span>
              <div className="mt-3" />
              <h4 className="mb-05">Empty</h4>
              <span className="badge badge-primary badge-empty" />
              <span className="badge badge-danger badge-empty ms-1" />
              <span className="badge badge-success badge-empty ms-1" />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Simple listview" source="component-listview.html">
        <div className="listview-title mt-2">Simple — full</div>
        <ul className="listview simple-listview">
          <li>John Fonseca</li>
          <li>Sophie</li>
          <li>Frank</li>
        </ul>
        <div className="listview-title mt-2">Simple — inset</div>
        <ul className="listview simple-listview inset">
          <li>John Fonseca</li>
          <li>Sophie</li>
          <li>Frank</li>
        </ul>
      </Section>

      <Section title="Link listview" source="component-listview.html">
        <ul className="listview link-listview inset">
          <li>
            <a href="#catalog" className="item" onClick={(e) => e.preventDefault()}>
              John Fonseca
            </a>
          </li>
          <li>
            <a href="#catalog" className="item" onClick={(e) => e.preventDefault()}>
              Sophie Silverton
              <span className="text-muted">Text</span>
            </a>
          </li>
          <li>
            <a href="#catalog" className="item" onClick={(e) => e.preventDefault()}>
              Frank Sjögren
              <span className="badge badge-primary">3</span>
            </a>
          </li>
        </ul>
      </Section>

      <Section title="Image listview" source="component-listview.html · component-badge.html">
        <ul className="listview image-listview inset">
          <li>
            <div className="item">
              <AvatarPlaceholder label="JF" />
              <div className="in">
                <div>Henry Richardson</div>
                <span className="badge badge-primary">6</span>
              </div>
            </div>
          </li>
          <li>
            <div className="item">
              <AvatarPlaceholder label="DL" tone="rose" />
              <div className="in">
                <div>Diane Lansdowne</div>
                <span className="badge badge-secondary">NEW</span>
              </div>
            </div>
          </li>
          <li>
            <div className="item">
              <AvatarPlaceholder label="LS" tone="blue" />
              <div className="in">
                <div>Lucas Simoes</div>
                <span className="badge badge-success">86</span>
              </div>
            </div>
          </li>
        </ul>
      </Section>

      <Section title="Icon listview" source="component-listview.html · component-card.html">
        <ul className="listview image-listview inset">
          <li>
            <a href="#catalog" className="item" onClick={(e) => e.preventDefault()}>
              <div className="icon-box bg-primary">
                <AppIcon icon="lucide:wallet" className="h-5 w-5 text-white" strokeWidth={1.75} />
              </div>
              <div className="in">
                <div>Wallet</div>
                <span className="text-muted">$ 5,503.30</span>
              </div>
            </a>
          </li>
          <li>
            <a href="#catalog" className="item" onClick={(e) => e.preventDefault()}>
              <div className="icon-box bg-danger">
                <AppIcon icon="lucide:credit-card" className="h-5 w-5 text-white" strokeWidth={1.75} />
              </div>
              <div className="in">
                <div>Cards</div>
                <span className="badge badge-primary">2</span>
              </div>
            </a>
          </li>
          <li>
            <a href="#catalog" className="item" onClick={(e) => e.preventDefault()}>
              <div className="icon-box bg-success">
                <AppIcon icon="lucide:banknote" className="h-5 w-5 text-white" strokeWidth={1.75} />
              </div>
              <div className="in">
                <div>Deposit</div>
              </div>
            </a>
          </li>
        </ul>
        <div className="section mt-3">
          <div className="card">
            <ul className="listview flush transparent image-listview text">
              <li>
                <a href="#catalog" className="item" onClick={(e) => e.preventDefault()}>
                  <div className="in">
                    <div>Settings</div>
                  </div>
                </a>
              </li>
              <li>
                <a href="#catalog" className="item" onClick={(e) => e.preventDefault()}>
                  <div className="in">
                    <div>Contacts</div>
                    <span className="badge badge-primary">8</span>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Section>
    </FinappCapsule>
  );
}
