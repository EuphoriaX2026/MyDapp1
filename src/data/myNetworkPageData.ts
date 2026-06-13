// src/data/myNetworkPageData.ts

export interface MenuItem {
  text: string;
  icon: string;
}

export const networkMenuItems: MenuItem[] = [
  { text: 'Direct Children', icon: 'lucide:box' },
  { text: 'Organization Information', icon: 'lucide:box' },
  { text: 'Remove Inactive Child', icon: 'lucide:box' },
  { text: 'Clear Blocked Users', icon: 'lucide:box' },
  { text: 'My Income Cap', icon: 'lucide:box' },
  { text: 'Upgrade Income Cap', icon: 'lucide:box' },
  { text: 'Lifetime Fee Status', icon: 'lucide:box' },
  { text: 'Total Number of Users', icon: 'lucide:box' },
  { text: 'User Status', icon: 'lucide:box' },
];