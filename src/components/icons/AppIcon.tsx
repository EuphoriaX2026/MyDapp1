import { Icon, type IconProps } from '@iconify/react';

export type AppIconProps = Omit<IconProps, 'icon'> & {
  icon: string;
};

/** Standard Iconify icon wrapper — preserves Tailwind / Finapp className styling. */
export function AppIcon({ icon, className, ...props }: AppIconProps) {
  return <Icon icon={icon} className={className} aria-hidden {...props} />;
}

export default AppIcon;
