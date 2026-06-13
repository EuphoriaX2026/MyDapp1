import { AppIcon } from '../components/icons/AppIcon';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useDisconnect } from 'wagmi';
import { useProfile } from '../context/ProfileContext';
import { FinappFormDialog } from '../components/ui/FinappFormDialog';
import { Modal } from '../components/Modal';
import '../styles/finapp-dialog.css';
import { AvatarCropModal } from '../components/ui/AvatarCropModal';
import { CUSTOM_APP_BG_KEY, CUSTOM_APP_BG_EVENT } from '../hooks/useCustomAppBackground';
import { getFinappDarkModePreference, setFinappDarkMode } from '../utils/finappThemeSync';
import '../styles/settings-page.css';

const truncateAddress = (address: string) => {
  if (!address) return 'Not Connected';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { username, setUsername, avatar, setAvatar } = useProfile();

  const [isChangeNameModalOpen, setChangeNameModalOpen] = useState(false);
  const [isWalletModalOpen, setWalletModalOpen] = useState(false);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [newName, setNewName] = useState('');

  const [notificationToggle, setNotificationToggle] = useState(
    () => localStorage.getItem('notificationToggle') === 'true'
  );
  const [privateProfileToggle, setPrivateProfileToggle] = useState(
    () => localStorage.getItem('privateProfileToggle') === 'true'
  );
  const [twoStepToggle, setTwoStepToggle] = useState(
    () => localStorage.getItem('twoStepToggle') === 'true'
  );

  const [customRpc, setCustomRpc] = useState('');
  const [savedRpc, setSavedRpc] = useState('');

  const [isDarkMode, setIsDarkMode] = useState(() => getFinappDarkModePreference());
  const [savedBg, setSavedBg] = useState<string | null>(() =>
    localStorage.getItem(CUSTOM_APP_BG_KEY)
  );

  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  const [avatarCropSource, setAvatarCropSource] = useState<string | null>(null);
  const [isAvatarCropOpen, setIsAvatarCropOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('notificationToggle', String(notificationToggle));
  }, [notificationToggle]);

  useEffect(() => {
    localStorage.setItem('privateProfileToggle', String(privateProfileToggle));
  }, [privateProfileToggle]);

  useEffect(() => {
    localStorage.setItem('twoStepToggle', String(twoStepToggle));
  }, [twoStepToggle]);

  useEffect(() => {
    const stored = localStorage.getItem('CUSTOM_RPC_URL');
    if (stored) {
      setSavedRpc(stored);
      setCustomRpc(stored);
    }
  }, []);

  useEffect(() => {
    setIsDarkMode(getFinappDarkModePreference());
  }, []);

  const handleDarkModeToggle = () => {
    const next = !isDarkMode;
    setFinappDarkMode(next);
    setIsDarkMode(next);
  };

  /** Avatar — pick file then square crop; saved locally via ProfileContext */
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarCropSource(reader.result as string);
      setIsAvatarCropOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAvatarCropConfirm = (croppedDataUrl: string) => {
    setAvatar(croppedDataUrl);
    setIsAvatarCropOpen(false);
    setAvatarCropSource(null);
  };

  const handleAvatarCropClose = () => {
    setIsAvatarCropOpen(false);
    setAvatarCropSource(null);
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    avatarFileInputRef.current?.click();
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      localStorage.setItem(CUSTOM_APP_BG_KEY, base64String);
      setSavedBg(base64String);
      window.dispatchEvent(new Event(CUSTOM_APP_BG_EVENT));
    };
    reader.readAsDataURL(file);
  };

  const handleClearBackground = () => {
    localStorage.removeItem(CUSTOM_APP_BG_KEY);
    setSavedBg(null);
    window.dispatchEvent(new Event(CUSTOM_APP_BG_EVENT));
    if (bgFileInputRef.current) bgFileInputRef.current.value = '';
  };

  const handleSaveRpc = () => {
    if (customRpc) {
      localStorage.setItem('CUSTOM_RPC_URL', customRpc);
      setSavedRpc(customRpc);
      alert('RPC saved. Please refresh the page to apply changes.');
      window.location.reload();
    }
  };

  const handleClearRpc = () => {
    localStorage.removeItem('CUSTOM_RPC_URL');
    setSavedRpc('');
    setCustomRpc('');
    alert('RPC removed. Returning to default settings.');
    window.location.reload();
  };

  const handleChangeNameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setNewName(username);
    setChangeNameModalOpen(true);
  };

  const handleNameSubmit = () => {
    if (newName && newName.trim() !== '') setUsername(newName.trim());
    setChangeNameModalOpen(false);
  };

  const handleLogoutAll = (e: React.MouseEvent) => {
    e.preventDefault();
    disconnect();
  };

  const preventNav = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div className="settings-page">
      <div className="appHeader">
        <div className="left">
          <button type="button" className="headerButton goBack" onClick={() => navigate(-1)}>
            <AppIcon icon="lucide:chevron-left" />
          </button>
        </div>
        <div className="pageTitle">Settings</div>
        <div className="right">
          <button type="button" className="headerButton" onClick={preventNav}>
            <AppIcon icon="lucide:bell" className="icon" />
            <span className="badge badge-danger">4</span>
          </button>
        </div>
      </div>

      <div id="appCapsule">
        <div className="section mt-3 text-center">
          <div className="avatar-section">
            <a href="#" onClick={handleAvatarClick}>
              <img src={avatar} alt="avatar" className="imaged w100 rounded" />
              <span className="button">
                <AppIcon icon="lucide:camera" />
              </span>
            </a>
          </div>
          <input
            type="file"
            accept="image/*"
            ref={avatarFileInputRef}
            onChange={handleAvatarFileSelect}
            className="d-none"
          />
          <h3 className="mb-05 profile-username">{username}</h3>
          <div className="text-muted">{truncateAddress(address || '')}</div>
        </div>

        <div className="listview-title mt-1">Theme</div>
        <ul className="listview image-listview text inset no-line">
          <li>
            <div className="item">
              <div className="in">
                <div>Dark Mode</div>
                <div className="form-check form-switch ms-2">
                  <input
                    className="form-check-input dark-mode-switch"
                    type="checkbox"
                    id="darkmodeSwitch"
                    checked={isDarkMode}
                    onChange={handleDarkModeToggle}
                  />
                  <label className="form-check-label" htmlFor="darkmodeSwitch" />
                </div>
              </div>
            </div>
          </li>
        </ul>

        <div className="listview-title mt-1">Appearance</div>
        <ul className="listview image-listview text inset no-line">
          <li>
            <div className="item">
              <div className="in settings-app-bg-in">
                <div>
                  App Background
                  <div className="text-muted">
                    Upload a custom wallpaper. Stored on your device only.
                  </div>
                </div>
                <div className="settings-app-bg-actions">
                  {savedBg && (
                    <button
                      type="button"
                      className="btn btn-text-danger btn-sm"
                      onClick={handleClearBackground}
                    >
                      <AppIcon icon="lucide:trash-2" />
                      Clear
                    </button>
                  )}
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    ref={bgFileInputRef}
                    onChange={handleBackgroundUpload}
                    className="d-none"
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-block btn-lg"
                    onClick={() => bgFileInputRef.current?.click()}
                  >
                    <AppIcon icon="lucide:image" />
                    {savedBg ? 'Change Background' : 'Upload Image (Max 2MB)'}
                  </button>
                  {savedBg && (
                    <img
                      src={savedBg}
                      alt="Custom background preview"
                      className="imaged img-fluid rounded settings-app-bg-preview"
                    />
                  )}
                </div>
              </div>
            </div>
          </li>
        </ul>

        <div className="listview-title mt-1">Notifications</div>
        <ul className="listview image-listview text inset">
          <li>
            <div className="item">
              <div className="in">
                <div>
                  Payment Alert
                  <div className="text-muted">Send notification when new payment received</div>
                </div>
                <div className="form-check form-switch ms-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="SwitchCheckDefault1"
                    checked={notificationToggle}
                    onChange={() => setNotificationToggle((p) => !p)}
                  />
                  <label className="form-check-label" htmlFor="SwitchCheckDefault1" />
                </div>
              </div>
            </div>
          </li>
          <li>
            <a href="#" className="item" onClick={preventNav}>
              <div className="in">
                <div>Notification Sound</div>
                <span className="text-primary">Beep</span>
              </div>
            </a>
          </li>
        </ul>

        <div className="listview-title mt-1">Profile Settings</div>
        <ul className="listview image-listview text inset">
          <li>
            <a href="#" className="item" onClick={handleChangeNameClick}>
              <div className="in">
                <div>Change Username</div>
              </div>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="item"
              onClick={(e) => {
                e.preventDefault();
                setWalletModalOpen(true);
              }}
            >
              <div className="in">
                <div>Your Wallet</div>
                <span className="text-primary">View</span>
              </div>
            </a>
          </li>
          <li>
            <div className="item">
              <div className="in">
                <div>Private Profile</div>
                <div className="form-check form-switch ms-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="SwitchCheckDefault2"
                    checked={privateProfileToggle}
                    onChange={() => setPrivateProfileToggle((p) => !p)}
                  />
                  <label className="form-check-label" htmlFor="SwitchCheckDefault2" />
                </div>
              </div>
            </div>
          </li>
        </ul>

        <div className="listview-title mt-1">Security</div>
        <ul className="listview image-listview text mb-2 inset">
          <li>
            <a href="#" className="item" onClick={preventNav}>
              <div className="in">
                <div>Update Password</div>
              </div>
            </a>
          </li>
          <li>
            <div className="item">
              <div className="in">
                <div>2 Step Verification</div>
                <div className="form-check form-switch ms-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="SwitchCheckDefault3"
                    checked={twoStepToggle}
                    onChange={() => setTwoStepToggle((p) => !p)}
                  />
                  <label className="form-check-label" htmlFor="SwitchCheckDefault3" />
                </div>
              </div>
            </div>
          </li>
          <li>
            <a
              href="#"
              className="item"
              onClick={(e) => {
                e.preventDefault();
                setIsNetworkModalOpen(true);
              }}
            >
              <div className="in">
                <div>Network Settings</div>
                <span className="text-primary">{savedRpc ? 'Custom' : 'Default'}</span>
              </div>
            </a>
          </li>
          <li>
            <a href="#" className="item" onClick={handleLogoutAll}>
              <div className="in">
                <div>Log out all devices</div>
              </div>
            </a>
          </li>
        </ul>
      </div>

      <FinappFormDialog
        isOpen={isChangeNameModalOpen}
        onClose={() => setChangeNameModalOpen(false)}
        title="Change Name"
        fieldLabel="Enter your new name"
        value={newName}
        onChange={setNewName}
        onSubmit={handleNameSubmit}
        submitLabel="OK"
        inputId="newUsername"
      />

      <Modal isOpen={isWalletModalOpen} onClose={() => setWalletModalOpen(false)}>
        <div className="modal-header">
          <h5 className="modal-title">Your Full Wallet Address</h5>
        </div>
        <div className="modal-body">{address || 'Not Connected'}</div>
        <div className="modal-footer">
          <div className="btn-inline">
            <button type="button" className="btn btn-text-primary" onClick={() => setWalletModalOpen(false)}>
              OK
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isNetworkModalOpen} onClose={() => setIsNetworkModalOpen(false)}>
        <div className="modal-header">
          <h5 className="modal-title">Network Settings</h5>
        </div>
        <div className="modal-body">
          <p className="text-muted">
            If you are having trouble connecting, enter a custom or proxied RPC node address.
          </p>
          <div className="form-group basic">
            <div className="input-wrapper">
              <label className="label">Custom RPC Address</label>
              <input
                type="text"
                className="form-control"
                placeholder="https://..."
                value={customRpc}
                onChange={(e) => setCustomRpc(e.target.value)}
              />
            </div>
          </div>
          {savedRpc && (
            <div className="alert alert-secondary mb-2">Currently using: {savedRpc}</div>
          )}
        </div>
        <div className="modal-footer">
          <div className="btn-inline">
            <button type="button" className="btn btn-text-primary" onClick={handleSaveRpc}>
              SAVE
            </button>
            {savedRpc && (
              <button type="button" className="btn btn-text-secondary" onClick={handleClearRpc}>
                RESET
              </button>
            )}
            <button type="button" className="btn btn-text-secondary" onClick={() => setIsNetworkModalOpen(false)}>
              CLOSE
            </button>
          </div>
        </div>
      </Modal>

      <AvatarCropModal
        isOpen={isAvatarCropOpen}
        imageSrc={avatarCropSource}
        onClose={handleAvatarCropClose}
        onConfirm={handleAvatarCropConfirm}
      />
    </div>
  );
}
