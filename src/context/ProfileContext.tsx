// src/context/ProfileContext.tsx

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useAccount } from 'wagmi';
import { media } from '../assets/media';

const LEGACY_USERNAME_KEY = 'userUsername';
const LEGACY_AVATAR_KEY = 'userAvatar';
const ACTIVE_WALLET_KEY = 'eone_active_wallet_address';

const generateInitialUsername = () => `E.ONE`;

function normalizeAddress(address: string) {
  return address.toLowerCase();
}

function profileUsernameKey(address: string) {
  return `profile:${normalizeAddress(address)}:username`;
}

function profileAvatarKey(address: string) {
  return `profile:${normalizeAddress(address)}:avatar`;
}

function loadUsernameForAddress(address: string): string {
  const key = profileUsernameKey(address);
  const stored = localStorage.getItem(key);
  if (stored) return stored;

  const activeWallet = localStorage.getItem(ACTIVE_WALLET_KEY);
  if (activeWallet && normalizeAddress(activeWallet) === normalizeAddress(address)) {
    const legacy = localStorage.getItem(LEGACY_USERNAME_KEY);
    if (legacy) {
      localStorage.setItem(key, legacy);
      localStorage.removeItem(LEGACY_USERNAME_KEY);
      return legacy;
    }
  }

  return generateInitialUsername();
}

function loadAvatarForAddress(address: string): string {
  const key = profileAvatarKey(address);
  const stored = localStorage.getItem(key);
  if (stored) return stored;

  const activeWallet = localStorage.getItem(ACTIVE_WALLET_KEY);
  if (activeWallet && normalizeAddress(activeWallet) === normalizeAddress(address)) {
    const legacy = localStorage.getItem(LEGACY_AVATAR_KEY);
    if (legacy) {
      localStorage.setItem(key, legacy);
      localStorage.removeItem(LEGACY_AVATAR_KEY);
      return legacy;
    }
  }

  return media.avatars.default;
}

interface ProfileContextType {
  username: string;
  setUsername: (name: string) => void;
  avatar: string;
  setAvatar: (avatar: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { address } = useAccount();
  const addressKey = address ? normalizeAddress(address) : undefined;

  const [username, setUsernameState] = useState(generateInitialUsername);
  const [avatar, setAvatarState] = useState(() => media.avatars.default);

  useEffect(() => {
    if (!addressKey) {
      setUsernameState(generateInitialUsername());
      setAvatarState(media.avatars.default);
      return;
    }

    setUsernameState(loadUsernameForAddress(addressKey));
    setAvatarState(loadAvatarForAddress(addressKey));
  }, [addressKey]);

  const setUsername = useCallback(
    (name: string) => {
      setUsernameState(name);
      if (addressKey) {
        localStorage.setItem(profileUsernameKey(addressKey), name);
      }
    },
    [addressKey],
  );

  const setAvatar = useCallback(
    (avatarDataUrl: string) => {
      setAvatarState(avatarDataUrl);
      if (addressKey) {
        localStorage.setItem(profileAvatarKey(addressKey), avatarDataUrl);
      }
    },
    [addressKey],
  );

  return (
    <ProfileContext.Provider value={{ username, setUsername, avatar, setAvatar }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
