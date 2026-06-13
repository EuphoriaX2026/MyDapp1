/**
 * One-off migration helper: ionicons + lucide-react -> @iconify/react (lucide: prefix)
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', 'src');

const ionToIconify = {
  arrowDownOutline: 'lucide:arrow-down',
  arrowUpOutline: 'lucide:arrow-up',
  arrowBackOutline: 'lucide:arrow-left',
  arrowForwardOutline: 'lucide:arrow-right',
  arrowUpCircleOutline: 'lucide:circle-arrow-up',
  cardOutline: 'lucide:credit-card',
  cartOutline: 'lucide:shopping-cart',
  cashOutline: 'lucide:banknote',
  chatbubblesOutline: 'lucide:messages-square',
  checkmark: 'lucide:check',
  checkmarkCircle: 'lucide:circle-check',
  checkmarkCircleOutline: 'lucide:circle-check',
  checkmarkOutline: 'lucide:check',
  chevronBackOutline: 'lucide:chevron-left',
  chevronDownOutline: 'lucide:chevron-down',
  chevronForwardOutline: 'lucide:chevron-right',
  close: 'lucide:x',
  closeOutline: 'lucide:x',
  constructOutline: 'lucide:wrench',
  cubeOutline: 'lucide:box',
  diamondOutline: 'lucide:diamond',
  documentTextOutline: 'lucide:file-text',
  ellipsisHorizontalOutline: 'lucide:ellipsis',
  ellipsisVerticalOutline: 'lucide:ellipsis-vertical',
  eyeOffOutline: 'lucide:eye-off',
  eyeOutline: 'lucide:eye',
  flashOutline: 'lucide:zap',
  gameController: 'lucide:gamepad-2',
  gameControllerOutline: 'lucide:gamepad-2',
  handLeftOutline: 'lucide:hand',
  helpCircleOutline: 'lucide:circle-help',
  home: 'lucide:home',
  homeOutline: 'lucide:home',
  imageOutline: 'lucide:image',
  logOutOutline: 'lucide:log-out',
  lockClosedOutline: 'lucide:lock',
  medalOutline: 'lucide:medal',
  menuOutline: 'lucide:menu',
  notificationsOutline: 'lucide:bell',
  pencilOutline: 'lucide:pencil',
  personAddOutline: 'lucide:user-plus',
  pieChartOutline: 'lucide:chart-pie',
  qrCodeOutline: 'lucide:qr-code',
  rocketOutline: 'lucide:rocket',
  settingsOutline: 'lucide:settings',
  shieldCheckmarkOutline: 'lucide:shield-check',
  speedometerOutline: 'lucide:gauge',
  swapHorizontalOutline: 'lucide:arrow-left-right',
  swapVertical: 'lucide:arrow-up-down',
  swapVerticalOutline: 'lucide:arrow-up-down',
  timeOutline: 'lucide:clock',
  trashOutline: 'lucide:trash-2',
  wallet: 'si:wallet-detailed-line',
  walletOutline: 'lucide:wallet',
  wifiOutline: 'lucide:wifi',
  alertCircleOutline: 'lucide:circle-alert',
  addOutline: 'lucide:plus',
  bagHandleOutline: 'lucide:shopping-bag',
  cameraOutline: 'lucide:camera',
};

const lucideToIconify = {
  Activity: 'lucide:activity',
  AlertTriangle: 'lucide:triangle-alert',
  ArrowDown: 'lucide:arrow-down',
  ArrowDownUp: 'lucide:arrow-down-up',
  ArrowLeft: 'lucide:arrow-left',
  ArrowLeftRight: 'lucide:arrow-left-right',
  ArrowRight: 'lucide:arrow-right',
  ArrowUp: 'lucide:arrow-up',
  ArrowUpRight: 'lucide:arrow-up-right',
  Banknote: 'lucide:banknote',
  BarChart3: 'lucide:chart-column',
  Bell: 'lucide:bell',
  Bitcoin: 'lucide:bitcoin',
  Briefcase: 'lucide:briefcase',
  BrushCleaning: 'lucide:brush-cleaning',
  Calendar: 'lucide:calendar',
  CalendarClock: 'lucide:calendar-clock',
  CalendarDays: 'lucide:calendar-days',
  Check: 'lucide:check',
  CheckCircle: 'lucide:circle-check',
  CheckCircle2: 'lucide:circle-check',
  ChevronDown: 'lucide:chevron-down',
  ChevronLeft: 'lucide:chevron-left',
  ChevronRight: 'lucide:chevron-right',
  ChevronUp: 'lucide:chevron-up',
  Circle: 'lucide:circle',
  CircleX: 'lucide:circle-x',
  Coins: 'lucide:coins',
  Copy: 'lucide:copy',
  Cpu: 'lucide:cpu',
  CreditCard: 'lucide:credit-card',
  Crown: 'lucide:crown',
  Diamond: 'lucide:diamond',
  Download: 'lucide:download',
  Edit2: 'lucide:pencil',
  ExternalLink: 'lucide:external-link',
  Eye: 'lucide:eye',
  EyeOff: 'lucide:eye-off',
  FileBarChart: 'lucide:file-chart-column',
  FileText: 'lucide:file-text',
  Fingerprint: 'lucide:fingerprint',
  Flame: 'lucide:flame',
  FlaskConical: 'lucide:flask-conical',
  Gift: 'lucide:gift',
  GitBranch: 'lucide:git-branch',
  Globe: 'lucide:globe',
  Globe2: 'lucide:earth',
  Heart: 'lucide:heart',
  History: 'lucide:history',
  Home: 'lucide:home',
  Image: 'lucide:image',
  Info: 'lucide:info',
  LayoutGrid: 'lucide:layout-grid',
  Loader2: 'lucide:loader-circle',
  Lock: 'lucide:lock',
  LogIn: 'lucide:log-in',
  LogOut: 'lucide:log-out',
  Mail: 'lucide:mail',
  Medal: 'lucide:medal',
  Menu: 'lucide:menu',
  MessageCircle: 'lucide:message-circle',
  MessageSquare: 'lucide:message-square',
  Minus: 'lucide:minus',
  MoreHorizontal: 'lucide:ellipsis',
  MoreVertical: 'lucide:ellipsis-vertical',
  Package: 'lucide:package',
  Pause: 'lucide:pause',
  Pencil: 'lucide:pencil',
  PieChart: 'lucide:chart-pie',
  Plane: 'lucide:plane',
  Play: 'lucide:play',
  PlayCircle: 'lucide:circle-play',
  Plus: 'lucide:plus',
  QrCode: 'lucide:qr-code',
  Receipt: 'lucide:receipt',
  Repeat: 'lucide:repeat',
  Rocket: 'lucide:rocket',
  RotateCcw: 'lucide:rotate-ccw',
  RotateCw: 'lucide:rotate-cw',
  Search: 'lucide:search',
  Send: 'lucide:send',
  Settings: 'lucide:settings',
  Share2: 'lucide:share-2',
  ShieldAlert: 'lucide:shield-alert',
  ShieldCheck: 'lucide:shield-check',
  ShoppingBag: 'lucide:shopping-bag',
  ShoppingCart: 'lucide:shopping-cart',
  Smartphone: 'lucide:smartphone',
  Snowflake: 'lucide:snowflake',
  Sparkles: 'lucide:sparkles',
  Star: 'lucide:star',
  Store: 'lucide:store',
  Swords: 'lucide:swords',
  Tag: 'lucide:tag',
  Trash2: 'lucide:trash-2',
  Trophy: 'lucide:trophy',
  Upload: 'lucide:upload',
  User: 'lucide:user',
  UserMinus: 'lucide:user-minus',
  UserPlus: 'lucide:user-plus',
  Users: 'lucide:users',
  Wallet: 'lucide:wallet',
  X: 'lucide:x',
  XCircle: 'lucide:circle-x',
  Zap: 'lucide:zap',
};

function relAppIconImport(filePath) {
  const dir = path.dirname(filePath);
  const rel = path.relative(dir, path.join(root, 'components', 'icons', 'AppIcon')).replace(/\\/g, '/');
  return rel.startsWith('.') ? rel : `./${rel}`;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'icons' && dir.endsWith('components')) continue;
      walk(full, files);
    } else if (/\.(tsx|ts)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function migrateIonFile(filePath, content) {
  let next = content;
  const used = new Set();

  const ionImport = next.match(/import\s*\{([^}]+)\}\s*from\s*['"]ionicons\/icons['"]/);
  if (!ionImport) return null;

  for (const part of ionImport[1].split(',')) {
    const name = part.trim();
    if (!name) continue;
    const iconify = ionToIconify[name];
    if (!iconify) {
      console.warn(`[ion] unmapped ${name} in ${filePath}`);
      continue;
    }
    used.add(name);
    next = next.replaceAll(`icon={${name}}`, `icon="${iconify}"`);
  }

  next = next.replace(/import\s*\{[^}]+\}\s*from\s*['"]ionicons\/icons['"];?\n?/g, '');
  next = next.replace(/import\s*\{\s*IonIcon\s*\}\s*from\s*['"]@ionic\/react['"];?\n?/g, '');

  if (next.includes('<IonIcon')) {
    next = next.replace(/<IonIcon\b/g, '<AppIcon');
  }

  if (!next.includes("from './icons/AppIcon'") && !next.includes('AppIcon')) {
    const importPath = `${relAppIconImport(filePath)}`;
    next = `import { AppIcon } from '${importPath}';\n${next}`;
  } else if (!next.includes('AppIcon')) {
    const importPath = `${relAppIconImport(filePath)}`;
    next = next.replace(/^/, `import { AppIcon } from '${importPath}';\n`);
  }

  return next;
}

function migrateLucideFile(filePath, content) {
  let next = content;
  const importMatch = next.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
  if (!importMatch) return null;

  const names = importMatch[1]
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && s !== 'type LucideIcon' && s !== 'LucideIcon');

  if (names.length === 0 && importMatch[1].includes('LucideIcon')) {
    next = next.replace(/import\s*type\s*\{\s*LucideIcon\s*\}\s*from\s*['"]lucide-react['"];?\n?/g, '');
    next = next.replace(/import\s*\{\s*type\s*LucideIcon\s*,?[^}]*\}\s*from\s*['"]lucide-react['"];?\n?/g, '');
    return next;
  }

  for (const name of names) {
    const iconify = lucideToIconify[name];
    if (!iconify) {
      console.warn(`[lucide] unmapped ${name} in ${filePath}`);
      continue;
    }
    next = next.replaceAll(`<${name}\b`, `<AppIcon icon="${iconify}"`);
    next = next.replaceAll(`</${name}>`, '</AppIcon>');
  }

  next = next.replace(/import\s*\{[^}]+\}\s*from\s*['"]lucide-react['"];?\n?/g, '');

  if (!next.includes('AppIcon')) {
    const importPath = `${relAppIconImport(filePath)}`;
    next = `import { AppIcon } from '${importPath}';\n${next}`;
  }

  return next;
}

const skip = new Set([
  path.join(root, 'components', 'icons', 'AppIcon.tsx'),
  path.join(root, 'Dashboard.old.tsx'),
]);

let changed = 0;
for (const file of walk(root)) {
  if (skip.has(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  if (content.includes('ionicons/icons') || content.includes("from '@ionic/react'") && content.includes('IonIcon')) {
    content = migrateIonFile(file, content) ?? content;
  }
  if (content.includes('lucide-react')) {
    content = migrateLucideFile(file, content) ?? content;
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    changed++;
    console.log('updated:', path.relative(root, file));
  }
}

console.log(`Done. ${changed} files updated.`);
