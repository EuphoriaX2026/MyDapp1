import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', 'src');

const lucideToIconify = {
  Activity: 'lucide:activity',
  AlertTriangle: 'lucide:triangle-alert',
  ArrowDown: 'lucide:arrow-down',
  ArrowLeft: 'lucide:arrow-left',
  ArrowRight: 'lucide:arrow-right',
  ArrowUp: 'lucide:arrow-up',
  ArrowUpRight: 'lucide:arrow-up-right',
  Banknote: 'lucide:banknote',
  Bell: 'lucide:bell',
  Bitcoin: 'lucide:bitcoin',
  Check: 'lucide:check',
  CheckCircle: 'lucide:circle-check',
  CheckCircle2: 'lucide:circle-check',
  ChevronDown: 'lucide:chevron-down',
  ChevronLeft: 'lucide:chevron-left',
  ChevronRight: 'lucide:chevron-right',
  ChevronUp: 'lucide:chevron-up',
  Circle: 'lucide:circle',
  CircleX: 'lucide:circle-x',
  Cpu: 'lucide:cpu',
  CreditCard: 'lucide:credit-card',
  Crown: 'lucide:crown',
  Eye: 'lucide:eye',
  EyeOff: 'lucide:eye-off',
  FileText: 'lucide:file-text',
  Fingerprint: 'lucide:fingerprint',
  Heart: 'lucide:heart',
  Home: 'lucide:home',
  LayoutGrid: 'lucide:layout-grid',
  Loader2: 'lucide:loader-circle',
  LogOut: 'lucide:log-out',
  Menu: 'lucide:menu',
  MessageCircle: 'lucide:message-circle',
  MessageSquare: 'lucide:message-square',
  Minus: 'lucide:minus',
  MoreHorizontal: 'lucide:ellipsis',
  MoreVertical: 'lucide:ellipsis-vertical',
  Pause: 'lucide:pause',
  PieChart: 'lucide:chart-pie',
  Play: 'lucide:play',
  Plus: 'lucide:plus',
  QrCode: 'lucide:qr-code',
  Repeat: 'lucide:repeat',
  Search: 'lucide:search',
  Settings: 'lucide:settings',
  Share2: 'lucide:share-2',
  ShieldAlert: 'lucide:shield-alert',
  ShieldCheck: 'lucide:shield-check',
  ShoppingBag: 'lucide:shopping-bag',
  Sparkles: 'lucide:sparkles',
  Star: 'lucide:star',
  Tag: 'lucide:tag',
  Upload: 'lucide:upload',
  User: 'lucide:user',
  Wallet: 'lucide:wallet',
  X: 'lucide:x',
  XCircle: 'lucide:circle-x',
  Zap: 'lucide:zap',
};

function relAppIconImport(filePath) {
  const dir = path.dirname(filePath);
  let rel = path.relative(dir, path.join(root, 'components', 'icons', 'AppIcon')).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.tsx$/.test(entry.name)) files.push(full);
  }
  return files;
}

for (const file of walk(root)) {
  if (file.includes('Dashboard.old')) continue;
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  for (const [name, iconify] of Object.entries(lucideToIconify)) {
    content = content.replaceAll(`<${name} `, `<AppIcon icon="${iconify}" `);
    content = content.replaceAll(`<${name}>`, `<AppIcon icon="${iconify}">`);
    content = content.replaceAll(`</${name}>`, '</AppIcon>');
  }

  content = content.replace(/\(\{ Icon, label \}\)/g, '({ icon, label })');
  content = content.replace(/\(\{ Icon, label,/g, '({ icon, label,');
  content = content.replace(/<item\.Icon /g, '<AppIcon icon={item.icon} ');

  if (content.includes('<AppIcon') && !/from ['"].*AppIcon['"]/.test(content)) {
    content = `import { AppIcon } from '${relAppIconImport(file)}';\n${content}`;
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('fixed:', path.relative(root, file));
  }
}
