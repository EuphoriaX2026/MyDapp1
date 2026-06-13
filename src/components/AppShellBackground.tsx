import { useLocation } from 'react-router-dom';
import { useCustomAppBackground } from '../hooks/useCustomAppBackground';
import { isPublicRoute } from '../utils/appRoutes';

/** Custom wallpaper from Settings — all app routes except public pages. */
export function AppShellBackground() {
  const location = useLocation();
  const customBg = useCustomAppBackground();

  if (isPublicRoute(location.pathname) || !customBg) {
    return null;
  }

  return (
    <div
      className="app-shell-wallpaper"
      aria-hidden
      style={{ backgroundImage: `url(${customBg})` }}
    />
  );
}

export default AppShellBackground;
