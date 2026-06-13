import { AppIcon } from '../../components/icons/AppIcon';
import { useState } from 'react';
import { CatalogTriggerList, ClearInputIcon, DepositFormFields } from './catalogHelpers';
import { AvatarPlaceholder, CatalogModal, FinappCapsule, Section } from './CatalogPrimitives';

type DialogKey =
  | 'basic'
  | 'block'
  | 'imaged'
  | 'success'
  | 'danger'
  | 'info'
  | 'iconBlock'
  | 'iconInline'
  | 'form'
  | 'image';

export function FinappFormsModalsTab() {
  const [dialog, setDialog] = useState<DialogKey | null>(null);
  const [modalboxOpen, setModalboxOpen] = useState(false);
  const [depositSheetOpen, setDepositSheetOpen] = useState(false);

  const closeDialog = () => setDialog(null);

  return (
    <FinappCapsule>
      <Section title="Form inputs — Basic" source="component-inputs.html">
        <div className="section mt-2">
          <div className="card">
            <div className="card-body">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-group basic">
                  <div className="input-wrapper">
                    <label className="label" htmlFor="catalog-userid">
                      User ID
                    </label>
                    <input type="text" className="form-control" id="catalog-userid" placeholder="Enter an User ID" />
                    <ClearInputIcon />
                  </div>
                </div>
                <div className="form-group basic">
                  <div className="input-wrapper">
                    <label className="label" htmlFor="catalog-amount">
                      Amount
                    </label>
                    <input type="text" className="form-control" id="catalog-amount" placeholder="Enter an Amount" />
                    <ClearInputIcon />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Animated labels" source="component-inputs.html">
        <div className="section mt-2">
          <div className="card">
            <div className="card-body">
              <p className="mb-05 text-sm opacity-70">Type to see floating label animation.</p>
              <div className="form-group basic animated">
                <div className="input-wrapper">
                  <label className="label" htmlFor="catalog-userid2">
                    User ID
                  </label>
                  <input type="text" className="form-control" id="catalog-userid2" placeholder="User ID" />
                  <ClearInputIcon />
                </div>
              </div>
              <div className="form-group basic animated">
                <div className="input-wrapper">
                  <label className="label" htmlFor="catalog-amount2">
                    Amount
                  </label>
                  <input type="text" className="form-control" id="catalog-amount2" placeholder="Amount" />
                  <ClearInputIcon />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Additional text & upload" source="component-inputs.html">
        <div className="section mt-2">
          <div className="card">
            <div className="card-body">
              <div className="form-group basic">
                <div className="input-wrapper">
                  <label className="label" htmlFor="catalog-userid3">
                    User ID
                  </label>
                  <input type="text" className="form-control" id="catalog-userid3" placeholder="Type an User ID" />
                  <ClearInputIcon />
                </div>
                <div className="input-info">Please type a user id</div>
              </div>
              <div className="form-group basic">
                <div className="input-wrapper">
                  <label className="label" htmlFor="catalog-amount3">
                    Amount
                  </label>
                  <input type="text" className="form-control" id="catalog-amount3" placeholder="Enter an amount" />
                  <ClearInputIcon />
                </div>
                <div className="input-info">Min $ 50 — Max $ 500</div>
              </div>
            </div>
          </div>
        </div>
        <div className="section mt-2">
          <div className="card">
            <div className="card-body">
              <div className="custom-file-upload" id="fileUpload1">
                <input type="file" id="catalog-file" accept=".png,.jpg,.jpeg" />
                <label htmlFor="catalog-file">
                  <span>
                    <strong className="inline-flex items-center gap-1">
                      <AppIcon icon="lucide:upload" className="h-5 w-5" />
                      <i>Upload a Photo</i>
                    </strong>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Input types" source="component-inputs.html">
        <div className="section mt-2">
          <div className="card">
            <div className="card-body">
              <form onSubmit={(e) => e.preventDefault()}>
                {[
                  { id: 'text4', label: 'Text', type: 'text', placeholder: 'Text Input' },
                  { id: 'email4', label: 'E-mail', type: 'email', placeholder: 'E-mail Input' },
                  { id: 'password4', label: 'Password', type: 'password', placeholder: 'Password Input' },
                  { id: 'phone4', label: 'Phone', type: 'tel', placeholder: 'Phone Input' },
                ].map((field) => (
                  <div key={field.id} className="form-group basic">
                    <div className="input-wrapper">
                      <label className="label" htmlFor={field.id}>
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        className="form-control"
                        id={field.id}
                        placeholder={field.placeholder}
                        autoComplete="off"
                      />
                      <ClearInputIcon />
                    </div>
                  </div>
                ))}
                <div className="form-group basic">
                  <div className="input-wrapper">
                    <label className="label" htmlFor="select4">
                      Select
                    </label>
                    <select className="form-control custom-select" id="select4" defaultValue="1">
                      <option value="1">Select 1</option>
                      <option value="2">Select 2</option>
                      <option value="3">Select 3</option>
                    </select>
                  </div>
                </div>
                <div className="form-group basic">
                  <div className="input-wrapper">
                    <label className="label" htmlFor="textarea4">
                      Textarea
                    </label>
                    <textarea id="textarea4" rows={2} className="form-control" placeholder="Textarea" />
                    <ClearInputIcon />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Boxed inputs" source="component-inputs.html">
        <div className="section mt-2 mb-2">
          <div className="card">
            <div className="card-body">
              <div className="form-group boxed">
                <div className="input-wrapper">
                  <label className="label" htmlFor="text4b">
                    Text
                  </label>
                  <input type="text" className="form-control" id="text4b" placeholder="Text Input" />
                  <ClearInputIcon />
                </div>
              </div>
              <div className="form-group boxed">
                <div className="input-wrapper">
                  <label className="label" htmlFor="email4b">
                    E-mail
                  </label>
                  <input type="email" className="form-control" id="email4b" placeholder="E-mail Input" />
                  <ClearInputIcon />
                </div>
              </div>
              <div className="form-group boxed">
                <div className="input-wrapper">
                  <label className="label" htmlFor="password4b">
                    Password
                  </label>
                  <input
                    type="password"
                    autoComplete="off"
                    className="form-control"
                    id="password4b"
                    placeholder="Password Input"
                  />
                  <ClearInputIcon />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Checkboxes" source="component-checkbox.html">
        <div className="section mt-1">
          <div className="section-title">Block</div>
          <div className="card">
            <div className="card-body">
              {['50', '100', '200'].map((amt, i) => (
                <div key={amt} className={`form-check${i < 2 ? ' mb-1' : ''}`}>
                  <input type="checkbox" className="form-check-input" id={`catalog-cb-${amt}`} defaultChecked={i === 0} />
                  <label className="form-check-label" htmlFor={`catalog-cb-${amt}`}>
                    $ {amt}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="section full mt-2">
          <div className="section-title">Checkbox list full</div>
          <div className="wide-block p-0">
            <div className="input-list">
              {['50', '100', '200'].map((amt) => (
                <div key={amt} className="form-check">
                  <input type="checkbox" className="form-check-input" id={`catalog-cl-${amt}`} />
                  <label className="form-check-label" htmlFor={`catalog-cl-${amt}`}>
                    $ {amt}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="section mt-2">
          <div className="section-title">Checkbox list inset</div>
          <div className="card">
            <div className="card-body p-0">
              <div className="input-list">
                {['50', '100', '200'].map((amt) => (
                  <div key={amt} className="form-check">
                    <input type="checkbox" className="form-check-input" id={`catalog-ci-${amt}`} />
                    <label className="form-check-label" htmlFor={`catalog-ci-${amt}`}>
                      $ {amt}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="section full mt-2 mb-2">
          <div className="wide-block p-0">
            <div className="input-list">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="catalog-switch" defaultChecked />
                <label className="form-check-label" htmlFor="catalog-switch">
                  Push notifications
                </label>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Dialogs" source="component-dialog.html" subtitle="Tap to open each dialog variant.">
        <div className="section mt-2">
          <div className="section-title">Basic</div>
          <div className="card">
            <CatalogTriggerList
              items={[
                { label: 'Basic — inline buttons', onClick: () => setDialog('basic') },
                { label: 'Block buttons', onClick: () => setDialog('block') },
                { label: 'With image (avatar)', onClick: () => setDialog('imaged') },
              ]}
            />
          </div>
        </div>
        <div className="section mt-2">
          <div className="section-title">Iconed</div>
          <div className="card">
            <CatalogTriggerList
              items={[
                { label: 'Info', onClick: () => setDialog('info') },
                { label: 'Success', onClick: () => setDialog('success') },
                { label: 'Danger', onClick: () => setDialog('danger') },
              ]}
            />
          </div>
        </div>
        <div className="section mt-2">
          <div className="section-title">Iconed buttons</div>
          <div className="card">
            <CatalogTriggerList
              items={[
                { label: 'Block button', onClick: () => setDialog('iconBlock') },
                { label: 'Inline button', onClick: () => setDialog('iconInline') },
              ]}
            />
          </div>
        </div>
        <div className="section mt-2 mb-2">
          <div className="section-title">More</div>
          <div className="card">
            <CatalogTriggerList
              items={[
                { label: 'Form dialog', onClick: () => setDialog('form') },
                { label: 'Image dialog', onClick: () => setDialog('image') },
                { label: 'Modalbox (full screen)', onClick: () => setModalboxOpen(true) },
                { label: 'Deposit action sheet', onClick: () => setDepositSheetOpen(true) },
              ]}
            />
          </div>
        </div>
      </Section>

      {/* Dialog: basic */}
      <CatalogModal open={dialog === 'basic'} onClose={closeDialog} modalClassName="dialogbox">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Sending $50 to John</h5>
            </div>
            <div className="modal-body">Are you sure about that?</div>
            <div className="modal-footer">
              <div className="btn-inline">
                <button type="button" className="btn btn-text-secondary" onClick={closeDialog}>
                  CANCEL
                </button>
                <button type="button" className="btn btn-text-primary" onClick={closeDialog}>
                  SEND
                </button>
              </div>
            </div>
          </div>
        </div>
      </CatalogModal>

      {/* Dialog: block */}
      <CatalogModal open={dialog === 'block'} onClose={closeDialog} modalClassName="dialogbox">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Sending $50 to John</h5>
            </div>
            <div className="modal-body">Are you sure about that?</div>
            <div className="modal-footer">
              <div className="btn-list">
                <button type="button" className="btn btn-text-primary btn-block" onClick={closeDialog}>
                  SEND
                </button>
                <button type="button" className="btn btn-text-secondary btn-block" onClick={closeDialog}>
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      </CatalogModal>

      {/* Dialog: imaged */}
      <CatalogModal open={dialog === 'imaged'} onClose={closeDialog} modalClassName="dialogbox">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="pt-3 text-center">
              <div className="mx-auto mb-1 flex justify-center">
                <AvatarPlaceholder label="JN" />
              </div>
            </div>
            <div className="modal-header pt-2">
              <h5 className="modal-title">Sending $50 to John</h5>
            </div>
            <div className="modal-body">Are you sure about that?</div>
            <div className="modal-footer">
              <div className="btn-inline">
                <button type="button" className="btn btn-text-secondary" onClick={closeDialog}>
                  CANCEL
                </button>
                <button type="button" className="btn btn-text-primary" onClick={closeDialog}>
                  SEND
                </button>
              </div>
            </div>
          </div>
        </div>
      </CatalogModal>

      {/* Dialog: success */}
      <CatalogModal open={dialog === 'success'} onClose={closeDialog} modalClassName="dialogbox">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-icon text-success">
              <AppIcon icon="lucide:circle-check" className="h-12 w-12" />
            </div>
            <div className="modal-header">
              <h5 className="modal-title">Success</h5>
            </div>
            <div className="modal-body">Your payment has been sent.</div>
            <div className="modal-footer">
              <div className="btn-inline">
                <button type="button" className="btn" onClick={closeDialog}>
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      </CatalogModal>

      {/* Dialog: danger */}
      <CatalogModal open={dialog === 'danger'} onClose={closeDialog} modalClassName="dialogbox">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-icon text-danger">
              <AppIcon icon="lucide:circle-x" className="h-12 w-12" />
            </div>
            <div className="modal-header">
              <h5 className="modal-title">Error</h5>
            </div>
            <div className="modal-body">There is something wrong.</div>
            <div className="modal-footer">
              <div className="btn-inline">
                <button type="button" className="btn" onClick={closeDialog}>
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      </CatalogModal>

      {/* Dialog: info */}
      <CatalogModal open={dialog === 'info'} onClose={closeDialog} modalClassName="dialogbox">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-icon">
              <AppIcon icon="lucide:credit-card" className="h-12 w-12" />
            </div>
            <div className="modal-header">
              <h5 className="modal-title">Expired Card</h5>
            </div>
            <div className="modal-body">Your card has been expired.</div>
            <div className="modal-footer">
              <div className="btn-inline">
                <button type="button" className="btn" onClick={closeDialog}>
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      </CatalogModal>

      {/* Dialog: icon block */}
      <CatalogModal open={dialog === 'iconBlock'} onClose={closeDialog} modalClassName="dialogbox">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Sending $50 to John</h5>
            </div>
            <div className="modal-body">Are you sure about that?</div>
            <div className="modal-footer">
              <div className="btn-list">
                <button type="button" className="btn btn-text-primary btn-block inline-flex items-center justify-center gap-2" onClick={closeDialog}>
                  <AppIcon icon="lucide:check" className="h-5 w-5" />
                  SEND
                </button>
                <button type="button" className="btn btn-text-danger btn-block inline-flex items-center justify-center gap-2" onClick={closeDialog}>
                  <AppIcon icon="lucide:x" className="h-5 w-5" />
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      </CatalogModal>

      {/* Dialog: icon inline */}
      <CatalogModal open={dialog === 'iconInline'} onClose={closeDialog} modalClassName="dialogbox">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Sending $50 to John</h5>
            </div>
            <div className="modal-body">Are you sure about that?</div>
            <div className="modal-footer">
              <div className="btn-inline">
                <button type="button" className="btn btn-text-danger inline-flex items-center gap-1" onClick={closeDialog}>
                  <AppIcon icon="lucide:x" className="h-5 w-5" />
                  CANCEL
                </button>
                <button type="button" className="btn btn-text-primary inline-flex items-center gap-1" onClick={closeDialog}>
                  <AppIcon icon="lucide:check" className="h-5 w-5" />
                  SEND
                </button>
              </div>
            </div>
          </div>
        </div>
      </CatalogModal>

      {/* Dialog: form */}
      <CatalogModal open={dialog === 'form'} onClose={closeDialog} modalClassName="dialogbox">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Deposit Money</h5>
            </div>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="modal-body text-start mb-2">
                <div className="form-group basic">
                  <div className="input-wrapper">
                    <label className="label" htmlFor="dialog-account1">
                      From
                    </label>
                    <select className="form-control custom-select" id="dialog-account1" defaultValue="0">
                      <option value="0">Savings (*** 5019)</option>
                      <option value="1">Investment (*** 6212)</option>
                    </select>
                  </div>
                  <div className="input-info">Select a bank account</div>
                </div>
                <div className="form-group basic">
                  <div className="input-wrapper">
                    <label className="label" htmlFor="dialog-text1">
                      Enter Amount
                    </label>
                    <input type="text" className="form-control" id="dialog-text1" defaultValue="100" />
                    <ClearInputIcon />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <div className="btn-inline">
                  <button type="button" className="btn btn-text-secondary" onClick={closeDialog}>
                    CANCEL
                  </button>
                  <button type="button" className="btn btn-text-primary" onClick={closeDialog}>
                    DEPOSIT
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </CatalogModal>

      {/* Dialog: image */}
      <CatalogModal open={dialog === 'image'} onClose={closeDialog} modalClassName="dialogbox">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="h-48 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600" role="img" aria-label="Sample" />
            <div className="modal-footer">
              <div className="btn-inline">
                <button type="button" className="btn btn-text-secondary" onClick={closeDialog}>
                  CANCEL
                </button>
                <button type="button" className="btn btn-text-primary" onClick={closeDialog}>
                  DONE
                </button>
              </div>
            </div>
          </div>
        </div>
      </CatalogModal>

      <CatalogModal open={modalboxOpen} onClose={() => setModalboxOpen(false)} modalClassName="modalbox">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Modal title</h5>
              <button type="button" className="btn btn-link p-0" onClick={() => setModalboxOpen(false)}>
                Close
              </button>
            </div>
            <div className="modal-body">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc fermentum, urna eget finibus fermentum,
                velit metus maximus erat, nec sodales elit justo vitae sapien.
              </p>
              <p>
                Donec in justo urna. Fusce pretium quam sed viverra blandit. Vivamus a facilisis lectus.
              </p>
              <p>Panel-compatible scroll body from component-modal-and-panels.html.</p>
            </div>
          </div>
        </div>
      </CatalogModal>

      <CatalogModal open={depositSheetOpen} onClose={() => setDepositSheetOpen(false)} modalClassName="action-sheet">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Balance</h5>
            </div>
            <div className="modal-body">
              <div className="action-sheet-content">
                <DepositFormFields onSubmit={() => setDepositSheetOpen(false)} />
              </div>
            </div>
          </div>
        </div>
      </CatalogModal>
    </FinappCapsule>
  );
}
