# گزارش فنی جامع پروژه E.ONE (MyDapp1 + MyERX + MyTitan)

> **تاریخ تهیه:** ۷ ژوئن ۲۰۲۶  
> **هدف:** مستندسازی کامل برای تهیه فایل `.cursorrules` و حفظ یکپارچگی UI، منطق Web3 و معماری کد  
> **منابع:** `D:\MyDapp1` · `D:\MyERX` · `D:\MyTitan`

---

## فهرست مطالب

1. [خلاصه اجرایی](#۱-خلاصه-اجرایی)
2. [معماری سه‌لایه پروژه](#۲-معماری-سه‌لایه-پروژه)
3. [Tech Stack — نسخه‌های دقیق](#۳-tech-stack--نسخه‌های-دقیق)
4. [استایل‌های سراسری و تایپوگرافی](#۴-استایل‌های-سراسری-و-تایپوگرافی)
5. [کامپوننت‌های UI اصلی (اجباری برای استفاده مجدد)](#۵-کامپوننت‌های-ui-اصلی)
6. [ساختار پوشه‌ها](#۶-ساختار-پوشه‌ها)
7. [مسیریابی (Routing)](#۷-مسیریابی-routing)
8. [لایه Web3 — wagmi، viem، قراردادها](#۸-لایه-web3)
9. [اکوسیستم MyERX — قراردادها و قوانین](#۹-اکوسیستم-myerx)
10. [اکوسیستم MyTitan — DeFi و MLM](#۱۰-اکوسیستم-mytitan)
11. [نقاط اتصال بین سه پروژه](#۱۱-نقاط-اتصال-بین-سه-پروژه)
12. [الگوهای معماری و قراردادهای کدنویسی](#۱۲-الگوهای-معماری)
13. [متغیرهای محیطی (Environment)](#۱۳-متغیرهای-محیطی)
14. [کاتالوگ UI داخلی (`/ui-test`)](#۱۴-کاتالوگ-ui-داخلی)
15. [توصیه‌ها برای `.cursorrules`](#۱۵-توصیه‌ها-برای-cursorrules)
16. [پیوست — جداول آدرس قراردادها](#۱۶-پیوست--جداول-آدرس)

---

## ۱. خلاصه اجرایی

پروژه **E.ONE** (نام npm: `e-one-front`) یک **DApp فین‌تک/سازمان غیرمتمرکز** است که سه لایه زیرساختی را یکپارچه می‌کند:

| لایه | مسیر | نقش |
|------|------|-----|
| **Frontend (DApp)** | `D:\MyDapp1` | رابط کاربری React، اتصال کیف پول، E-Dex، فروشگاه، فعال‌سازی پکیج، داشبورد MLM |
| **Token Layer** | `D:\MyERX` | توکن ERX (Euphoria)، DEX، کارمزد، EGuard، UpdateFund |
| **DeFi/MLM Layer** | `D:\MyTitan` | باینری‌تری، پکیج‌ها، Bank، Store، Engine، Lens |

**اولویت مطلق در توسعه:** قوانین و منطق قراردادهای هوشمند در `MyERX` و `MyTitan` همیشه بر UI و منطق فرانت‌اند اولویت دارند. فرانت‌اند نباید رفتاری خلاف قرارداد پیاده‌سازی کند.

**شبکه پیش‌فرض:** Polygon Amoy Testnet (chainId `80002`) — حالت `testnet`  
**شبکه تولید:** Polygon Mainnet (chainId `137`) — ERX روی mainnet deploy شده؛ MyTitan و DApp هنوز placeholder دارند

**آمار کلی MyDapp1:**
- ~۳۵۵ فایل در `src/`
- ۴۱ hook سفارشی
- ۷۲ کامپوننت
- ۲۰ ABI
- ۹ فایل config
- ~۵۵ فایل با import مستقیم wagmi/viem

---

## ۲. معماری سه‌لایه پروژه

```
┌─────────────────────────────────────────────────────────────────┐
│                    D:\MyDapp1  (E.ONE Frontend)                  │
│  React 19 · Vite 6 · wagmi/viem · RainbowKit · Tailwind+Finapp  │
└────────────────────────────┬────────────────────────────────────┘
                             │ ABI + آدرس‌ها
         ┌───────────────────┴───────────────────┐
         ▼                                       ▼
┌─────────────────────┐               ┌─────────────────────┐
│   D:\MyERX          │               │   D:\MyTitan        │
│   ERX · EDex        │◄── IERX ─────►│   Bank · Store      │
│   EGuard · EConfigs │    IEDex      │   Register · Engine │
│   ERouter           │               │   Panel · Lens · E1 │
└─────────────────────┘               └─────────────────────┘
```

### جریان اقتصادی (خلاصه)

1. **ERX** از طریق **EDex** خرید/فروش می‌شود (منحنی bonding curve).
2. کاربر ERX را در **Store** (MyTitan) خرج می‌کند → ERX به **Bank** واریز می‌شود.
3. **E1** (توکن داخلی ۱:۱ USD) برای فعال‌سازی پکیج، پاداش هفتگی و بازپرداخت Store استفاده می‌شود.
4. **Bank** ERX را به عنوان وثیقه/خزانه نگه می‌دارد و قیمت ERX/USD را از **IEDex** می‌خواند.
5. **Lens** لایه read-only برای تمام داده‌های UI است — **Panel** برای write operations.

---

## ۳. Tech Stack — نسخه‌های دقیق

### ۳.۱. هسته Frontend

| تکنولوژی | نسخه (package.json) | نقش |
|----------|---------------------|-----|
| **React** | `^19.1.0` | UI framework |
| **React DOM** | `^19.1.0` | رندر |
| **TypeScript** | `~5.8.3` | تایپ‌گذاری |
| **Vite** | `^6.3.5` | bundler / dev server |
| **@vitejs/plugin-react** | `^4.4.1` | پلاگین React |

### ۳.۲. مسیریابی

| تکنولوژی | نسخه | جزئیات |
|----------|------|--------|
| **react-router-dom** | `^7.13.0` | `HashRouter` (مناسب PWA/Capacitor) |
| **Lazy loading** | React.lazy + Suspense | تقریباً همه صفحات |
| **Fallback** | `<Loader />` | لودر تمام‌صفحه با لوگوی E.ONE |

### ۳.۳. Web3

| تکنولوژی | نسخه | جزئیات |
|----------|------|--------|
| **wagmi** | `^2.19.5` | hooks اصلی: `useReadContract`, `useWriteContract`, `useAccount` |
| **viem** | `^2.46.2` | `formatEther`, `parseUnits`, `BaseError` |
| **@rainbow-me/rainbowkit** | `^2.2.7` | اتصال کیف پول + UI modal |
| **@tanstack/react-query** | `^5.90.21` | cache/query برای wagmi |
| **ethers** | `^6.14.3` | در `package.json` هست ولی **هیچ import مستقیمی در `src/` وجود ندارد** |

**شبکه‌ها (wagmi chains):**
- Testnet: `polygonAmoy` (chainId `80002`)
- Mainnet: `polygon` (chainId `137`)
- انتخاب از `VITE_NETWORK_MODE` در `src/config/networks.ts`

**کیف پول‌های پشتیبانی‌شده (RainbowKit):**
MetaMask, Trust, SafePal, TokenPocket, Coinbase, WalletConnect, Safe, Rainbow, Phantom, Brave, Ledger, Argent, Injected

### ۳.۴. استایل‌دهی (Hybrid Stack)

| ابزار | نسخه | نقش |
|-------|------|-----|
| **Tailwind CSS** | `^3.4.19` | لایه Glass جدید، utility classes |
| **PostCSS** | `^8.5.6` | pipeline |
| **autoprefixer** | `^10.4.27` | vendor prefixes |
| **Sass/SCSS** | `^1.89.2` | قالب Finapp v2 (legacy) |
| **Bootstrap** | `^5.3.6` | modals, tabs, toasts, listviews |
| **clsx** | `^2.1.1` | ترکیب className |

**نکته معماری:** پروژه در حال **مهاجرت تدریجی** از Finapp SCSS + Bootstrap به Tailwind Glass است. UI جدید باید Tailwind + CSS variables استفاده کند؛ Bootstrap فقط برای الگوهای legacy.

### ۳.۵. UI و انیمیشن

| کتابخانه | نسخه | کاربرد |
|----------|------|--------|
| **@ionic/react** | `^8.6.1` | setupIonicReact، آیکون‌ها |
| **ionicons** | `^8.0.9` | آیکون Ionic |
| **framer-motion** | `^12.34.3` | انیمیشن |
| **lucide-react** | `^0.575.0` | آیکون (PageHeader و...) |
| **@heroicons/react** | `^2.2.0` | آیکون |
| **react-icons** | `^5.6.0` | آیکون |
| **phosphor-react** | `^1.4.1` | آیکون |
| **apexcharts** | `^4.7.0` | نمودارها |
| **@splidejs/splide** | `^4.1.4` | carousel |
| **unicornstudio-react** | `^2.0.1-1` | افکت بصری |

### ۳.۶. موبایل و PWA

| تکنولوژی | نسخه | نقش |
|----------|------|-----|
| **@capacitor/core** | `^8.1.0` | wrapper اندروید |
| **@capacitor/android** | `^8.1.0` | build اندروید |
| **vite-plugin-pwa** | `^1.2.0` | Service Worker + manifest |
| **base path** | `./` | relative paths برای deploy |

### ۳.۷. Smart Contracts (MyERX / MyTitan)

| تکنولوژی | نسخه | مسیر |
|----------|------|------|
| **Solidity** | `^0.8.28` | Foundry |
| **OpenZeppelin** | latest (lib) | ERC20, AccessControl, Ownable2Step |
| **Foundry** | — | build, test, deploy |

---

## ۴. استایل‌های سراسری و تایپوگرافی

### ۴.۱. فایل‌های CSS/SCSS اصلی (ترتیب import در `main.tsx`)

| فایل | مسیر | نقش |
|------|------|-----|
| `index.css` | `src/index.css` | reset، RainbowKit overrides |
| `fonts.css` | `src/styles/fonts.css` | `@font-face` فونت Inter (۶ وزن) |
| `app-typography.css` | `src/styles/app-typography.css` | متغیرهای تایپو، Bootstrap font hijack |
| `tailwind.css` | `src/styles/tailwind.css` | `@tailwind base/components/utilities` + glass utilities |
| `finapp-app-theme.css` | `src/styles/finapp-app-theme.css` | **منبع اصلی CSS variables** |
| `eone-sidebar.css` | `src/styles/eone-sidebar.css` | استایل sidebar اختصاصی E.ONE |
| `style.scss` | `src/styles/style.scss` | Finapp kit کامل (Bootstrap + ui/*) — import در App.tsx |
| `invisible-mobile-frame.css` | `src/styles/invisible-mobile-frame.css` | ستون ۲۸rem دسکتاپ |
| `mywallet2-page.css` | `src/styles/mywallet2-page.css` | استایل صفحه MyWallet2 |

### ۴.۲. SCSS Variables (`src/styles/_variables.scss`)

```scss
// رنگ‌های اصلی
$colorPrimary: #6236FF;
$colorSecondary: #8494A8;
$colorSuccess: #1DCC70;
$colorDanger: #FF396F;
$colorWarning: #FFB400;
$colorInfo: #05D0A4;

// پس‌زمینه و متن
$bodyBackground: #EDEDF5;
$colorHeading: #27173E;
$colorText: rgb(149, 141, 158);
$colorLight: #A9ABAD;
$colorLine: #DCDCE9;
$borderRadius: 10px;

// Dark Mode
$darkmode_bodyBackground: #030108;
$darkmode_contentBackground: #161129;
$darkmode_colorHeading: #fff;
$darkmode_colorText: #8f82a5;
$darkmode_colorLight: #69587f;
$darkmode_colorLine: #2d1f3b;

// تایپوگرافی
$fontSize: 15px;
$fontSizeHeading: 17px;
$fontSizeHeadingLarge: 20px;
$fontSizeHeadingXLarge: 32px;
$fontSizeSub: 13px;
$fontSizeCaption: 11px;
$bodyLineHeight: 1.6rem;
$bodyLetterSpacing: 0.004em;
```

### ۴.۳. CSS Custom Properties — Light Mode (`body.finapp-app-shell`)

| متغیر | مقدار | کاربرد |
|-------|-------|--------|
| `--finapp-body-bg` | `#ededf5` | پس‌زمینه body |
| `--finapp-content-bg` | `#ffffff` | پس‌زمینه کارت/محتوا |
| `--finapp-heading` | `#27173e` | عناوین |
| `--finapp-text` | `rgb(149, 141, 158)` | متن اصلی |
| `--finapp-text-light` | `#a9abad` | متن کم‌رنگ |
| `--finapp-line` | `#dcdce9` | خطوط/jdivider |
| `--finapp-primary` | `#6236ff` | رنگ برند |
| `--app-glass-bg` | `#ffffff` | پس‌زمینه glass panel |
| `--app-glass-border` | `#dcdce9` | border glass |
| `--app-nav-bg` | `rgba(255,255,255,0.88)` | نوار ناوبری |
| `--app-nav-active-pill` | `rgba(98,54,255,0.12)` | pill فعال |

### ۴.۴. CSS Custom Properties — Dark Mode (`body.finapp-app-shell.dark-mode`)

| متغیر | مقدار |
|-------|-------|
| `--finapp-body-bg` | `#030108` |
| `--finapp-content-bg` | `#161129` |
| `--finapp-heading` | `#ffffff` |
| `--finapp-text` | `#8f82a5` |
| `--finapp-line` | `#2d1f3b` |
| `--app-glass-input-bg` | `#1e1630` |
| `--app-nav-bg` | `rgba(22,17,41,0.94)` |

### ۴.۵. Sidebar Variables (`--eone-sidebar-*`)

متغیرهای اختصاصی sidebar در `finapp-app-theme.css` و `eone-sidebar.css`:
- `--eone-sidebar-container-bg`, `--eone-sidebar-menu-bg`
- `--eone-sidebar-menu-active-bg`, `--eone-sidebar-menu-active-color`
- `--eone-sidebar-logout-color: #ef4444`

### ۴.۶. Tailwind Theme Extensions (`tailwind.config.js`)

- **Font:** `Inter` (sans), monospace stack
- **Brand colors:** `brand.pink/blue/indigo` → `#6236FF`
- **Surface:** bound به `--finapp-body-bg`, `--finapp-content-bg`
- **Shadows:** `glass-base`, `glass-highlight`, `glass-elevated`
- **Backgrounds:** `glass-gradient`, `frosted-mesh`
- **Backdrop blur:** `glass: 20px`, `glass-heavy: 40px`

### ۴.۷. Tailwind Glass Utilities (`tailwind.css`)

کلاس‌های کلیدی که AI باید استفاده کند:
- `.glass-panel` — کارت شیشه‌ای اصلی
- `.glass-button` — دکمه شیشه‌ای
- `.dapp-page` — wrapper صفحات DApp
- `.frosted-background` — پس‌زمینه frosted mesh

### ۴.۸. Typography

- **فونت اصلی:** Inter (۶ وزن: Thin, Regular, Medium, Bold, ExtraBold, Black)
- **مسیر فونت‌ها:** `src/assets/fonts/inter/*.woff`
- **متغیر CSS:** `--app-font-family`, `--app-font-mono`
- **Bootstrap override:** `--bs-body-font-family` در `app-typography.css`
- **RainbowKit:** Inter 700/500/400 در modal

### ۴.۹. Theme Scopes (دو shell)

| Class روی body | مسیرها | ظاهر |
|----------------|--------|------|
| `finapp-public-shell` | `/login`, `/register`, `/public-edex`, `/services`, ... | cosmic background، RainbowKit glass |
| `finapp-app-shell` | بقیه مسیرهای احراز هویت‌شده | Finapp light/dark |
| `dark-mode` | toggle از Settings | dark palette |

**مدیریت theme:** `src/utils/finappThemeSync.ts` — `syncFinappTheme()`, `guardPublicTheme()`, `guardAppTheme()`

### ۴.۱۰. CSS صفحه‌ای (Page-specific)

| فایل | مسیر URL | وضعیت |
|------|----------|-------|
| `dashboard-page.css` | `/MyWallet` | partial |
| `mywallet2-page.css` | `/MyWallet2` | partial |
| `send-money-page.css` | `/send-money` | partial |
| `edex-page.css` | `/edex` | partial |
| `settings-page.css` | `/settings` | partial |
| `activate-page.css` | `/Activate` | partial |
| `wallet-flow-page.css` | wallet flows | partial |
| `my-plan.css` | `/my-plan` | partial |
| `finapp-bank-cards.css` | bank cards | active |
| `charts.css` | charts | partial |
| `mobile-modals.css` | modals | partial |
| `cards.css` | wallet cards | partial |

---

## ۵. کامپوننت‌های UI اصلی

> **قانون طلایی:** برای صفحات جدید، از این کامپوننت‌ها استفاده کنید — UI سفارشی از صفر ممنوع مگر در کاتالوگ تأیید شده باشد.

### ۵.۱. Design System — Glass / Finapp (`components/ui/`)

| کامپوننت | مسیر | توضیح | مصرف‌کنندگان |
|----------|------|-------|-------------|
| **GlassCard** | `components/ui/glass/GlassCard.tsx` | wrapper شیشه‌ای + glow اختیاری (`pink`/`blue`/`indigo`) | Register, Activate, Store Checking, NFTDetails, WalletFlow |
| **GlassButton** | `components/ui/glass/GlassButton.tsx` | variants: `primary`, `secondary`, `icon`, `liquid-blue` | Register, ui-catalog |
| **PremiumStepper** | `components/ui/glass/PremiumStepper.tsx` | stepper ۴ مرحله‌ای ثبت‌نام | Register |
| **FinappPilledTabs** | `components/ui/FinappPilledTabs.tsx` | تب‌های capsule-style Finapp | EDex, PublicEDex |
| **SwapCard** | `components/ui/SwapCard.tsx` | UI swap E-Dex با SVG fluid card | EDex, PublicEDex |
| **AmountDisplay** | `components/ui/AmountDisplay.tsx` | نمایش مبلغ با جداکننده هزارگان | wallet, edex |
| **PageHeader** | `components/ui/PageHeader.tsx` | back + title مرکزی | **تعریف شده ولی استفاده نشده** |
| **SmartWallet** | `components/ui/SmartWallet.tsx` | carousel کارت‌های درآمد | MyWallet |
| **EGuardPenaltyBanner** | `components/ui/EGuardPenaltyBanner.tsx` | هشدار ۲۰٪ مالیات شبکه | EDex |
| **LegalDisclaimerModal** | `components/ui/LegalDisclaimerModal.tsx` | disclaimer حقوقی | activation flows |
| **PublicCosmicBackground** | `components/ui/PublicCosmicBackground.tsx` | پس‌زمینه cosmic | public routes |
| **AvatarCropModal** | `components/ui/AvatarCropModal.tsx` | crop آواتار مربعی | Settings |

**Barrel export:** `components/ui/glass/index.ts` → `GlassCard`, `GlassButton`, `PremiumStepper`

### ۵.۲. App Shell و Navigation

| کامپوننت | مسیر | نقش |
|----------|------|-----|
| **Layout** | `components/Layout.tsx` | shell `.dapp-page` + `#appCapsule` + `SendActionSheet` |
| **AppRouteShells** | `components/layout/AppRouteShells.tsx` | `FullBleedShell` vs `InvisibleMobileFrameShell` |
| **PageLayout** | `components/layout/PageLayout.tsx` | layout صفحه‌ای |
| **AppMobileBottomNav** | `components/AppMobileBottomNav.tsx` | bottom nav موبایل |
| **Sidebar** | `components/Sidebar.tsx` | منوی E.ONE (Dashboard / My Plan) |
| **Header** | `components/Header.tsx` | header بالای صفحه |
| **BottomMenu** | `components/BottomMenu.tsx` | legacy Finapp |
| **Loader** | `components/Loader.tsx` | suspense fallback — **پرکاربردترین** |
| **ProtectedRoute** | `components/ProtectedRoute.tsx` | gate کیف پول — ۱۷+ route |
| **AppShellBackground** | `components/AppShellBackground.tsx` | پس‌زمینه shell |
| **PwaPrompt** | `components/PwaPrompt.tsx` | نصب PWA |

### ۵.۳. Web3 و Wallet

| کامپوننت | مسیر | نقش |
|----------|------|-----|
| **WalletConnection** | `components/WalletConnection.tsx` | wrapper RainbowKit |
| **SendActionSheet** | `components/SendActionSheet.tsx` | sheet ارسال ERX + fee quote — **یک بار در Layout mount** |
| **WalletFlowPageShell** | `components/wallet/WalletFlowPageShell.tsx` | shell Send/Checking |
| **AccountsModal** | `components/AccountsModal.tsx` | modal حساب‌ها |

### ۵.۴. Domain — MLM / Store / Activate

| کامپوننت | مسیر | نقش |
|----------|------|-----|
| **ProfileCard** | `components/ProfileCard.tsx` | کارت پروفایل داشبورد |
| **PointsMatrixCard** | `components/profile/PointsMatrixCard.tsx` | ماتریس امتیاز |
| **FinappBankCards** | `components/FinappBankCards.tsx` | خرید کارت بانکی (Store/Bank) |
| **ActivateCartView** | `components/activate/ActivateCartView.tsx` | سبد فعال‌سازی |
| **ActivateCheckoutModal** | `components/activate/ActivateCheckoutModal.tsx` | checkout modal |
| **ActivateProductCard** | `components/activate/ActivateProductCard.tsx` | کارت محصول realm |
| **ActivateZapStepper** | `components/activate/ActivateZapStepper.tsx` | stepper zap |
| **StoreCartPanel** | `components/store/StoreCartPanel.tsx` | پنل سبد فروشگاه |
| **StoreRealmProductCard** | `components/store/StoreRealmProductCard.tsx` | کارت محصول realm |
| **StoreHeaderHero** | `components/store/StoreHeaderHero.tsx` | hero فروشگاه |

### ۵.۵. Feedback و Modals

| کامپوننت | مسیر | نقش |
|----------|------|-----|
| **Toast** | `components/Toast.tsx` | toast Bootstrap + Ionic icons | **فقط EDex/PublicEDex** |
| **Modal** | `components/Modal.tsx` | modal عمومی Bootstrap |
| **TransactionModals** | `components/TransactionModals.tsx` | modals تراکنش MLM |
| **WithdrawModal** | `components/WithdrawModal.tsx` | modal برداشت |
| **PackageModal** | `components/PackageModal.tsx` | modal پکیج |

### ۵.۶. Charts و Data Display

| کامپوننت | مسیر | نقش |
|----------|------|-----|
| **CoinChart** | `components/CoinChart.tsx` | ApexCharts wrapper |
| **EarningChart** | `components/EarningChart.tsx` | نمودار درآمد |
| **ReportTable** | `components/ReportTable.tsx` | جدول گزارش |
| **RecentTransactions** | `components/RecentTransactions.tsx` | تراکنش‌های اخیر |
| **PortfolioList** | `components/PortfolioList.tsx` | لیست portfolio |

### ۵.۷. Error Boundaries

| کامپوننت | مسیر |
|----------|------|
| **RouteErrorBoundary** | `components/RouteErrorBoundary.tsx` |
| **ExchangeErrorBoundary** | `components/ExchangeErrorBoundary.tsx` |

---

## ۶. ساختار پوشه‌ها

### ۶.۱. MyDapp1 — `src/`

```
src/
├── abis/                    # 20 فایل ABI (JSON + 1 TS)
├── assets/                  # sass/css/js/img/fonts (Finapp template legacy)
├── components/              # 72 کامپوننت React
│   ├── ui/                  # Design system
│   │   └── glass/           # GlassCard, GlassButton, PremiumStepper
│   ├── activate/            # 9 کامپوننت فعال‌سازی
│   ├── store/               # 6 کامپوننت فروشگاه
│   ├── layout/              # AppRouteShells, PageLayout
│   ├── wallet/              # WalletFlowPageShell
│   └── profile/             # PointsMatrixCard
├── config/                  # 9 فایل تنظیمات
│   ├── wagmi.ts             # RainbowKit + transports + ERC20_ABI
│   ├── networks.ts          # VITE_NETWORK_MODE
│   ├── erx-contracts.ts     # آدرس‌های MyERX
│   ├── my-titan-contracts.ts# آدرس‌های MyTitan
│   ├── edex-tokens.ts       # metadata توکن‌های E-Dex
│   ├── edex-fees.ts         # ثابت‌های fee
│   ├── wallet-coins.ts      # لوگو/نماد coins
│   └── constants.ts         # fee %, decimals
├── context/                 # Profile, RegisteredWallets, Cart
├── data/                    # داده‌های استاتیک (catalog, roadmap, ...)
├── hooks/                   # 41 hook (Web3 + domain)
├── pages/                   # 39 فایل صفحه
│   ├── public/              # Login, Register, PublicEDex
│   ├── wallet/              # SendMoney, CheckingCredit
│   ├── store/               # Store, Cart, ProductDetail
│   ├── activate/            # ActivateExecution
│   └── ui-catalog/          # 15 فایل کاتالوگ design system
├── providers/               # WagmiProvider + RainbowKit + QueryClient
├── storage/                 # activateCartStorage
├── styles/                  # 70 فایل CSS/SCSS
├── types/                   # activate.ts, index.ts
├── utils/                   # 24 utility
├── App.tsx                  # HashRouter + routes
├── main.tsx                 # entry point
└── index.css                # global reset
```

### ۶.۲. ABIs — `src/abis/`

| دسته | فایل‌ها | منبع |
|------|---------|------|
| **ERX Phase 2** | `edex.json`, `erouter.json`, `econfigs.json`, `eguard.json`, `erx-token.json`, `update-fund.json`, `mock-usdt.json` | MyERX |
| **MyTitan** | `*-titan.json` (Router, Configs, Ledger, Bank, Store, AssetMaker, Panel, Lens, E1, Register, Engine, Activator, Turbo) | MyTitan |
| **TS fragment** | `activatorPricingAbi.ts` | `calculatePriceWithPenalty` (خارج از JSON) |
| **Inline** | `ERC20_ABI` در `config/wagmi.ts` | generic token ops |

**الگوی import:**
```typescript
import PanelABI from '../abis/Panel-titan.json'
useReadContract({ abi: PanelABI, address: TITAN_CONTRACTS.Panel, ... })
```

### ۶.۳. Hooks — `src/hooks/` (۴۱ hook)

| دسته | Hooks |
|------|-------|
| **Web3 Core** | `useWallet`, `useContractInteraction`, `useTokenApproval`, `useTransfer`, `useNetworkSwitch`, `useGasEstimation` |
| **ERX / E-Dex** | `useEdexSwapQuote`, `useEdexFeeRates`, `useEdexTokenPrices`, `useEuphoriaExchange`, `useTransferFeeQuote`, `useEguardPenalty` |
| **MyTitan / MLM** | `useDashboard`, `usePointsMatrix`, `useTeamReport`, `useRftIncome`, `useActivationZap`, `useActivateCheckout`, `useActivateCart`, `useRealmActivationEligibility`, `useActivatorPackagePrice`, `useUserGroupRemainingDays` |
| **Wallet UI** | `useTotalBalance`, `usePortfolioBalance`, `useAccountBalances`, `useMobileWallet`, `useWalletTokenMarketData`, `useCoinChartData` |
| **Store** | `useStoreCart`, `useBuyRealmProduct` |
| **Misc** | `useDisclaimer`, `usePwaInstall`, `useCustomAppBackground`, `useBootstrapModal`, `useCryptoPrices`, `useStablecoinInfo`, `useStaking`, `useDEXOperations`, `useExchangeOperations`, `useTransactionHistory`, `useAllowanceManager`, `useErxCreditCardPrice`, `useActivatePaymentRoute`, `useActivationKind` |

**الگوی معماری:** domain hooks خودشان ABI + address wiring را encapsulate می‌کنند.

### ۶.۴. Context Providers

| Context | فایل | نقش |
|---------|------|-----|
| **ProfileContext** | `context/ProfileContext.tsx` | پروفایل کاربر، آواتار |
| **RegisteredWalletsContext** | `context/RegisteredWalletsContext.tsx` | کیف پول‌های ثبت‌شده |
| **CartContext** | `context/CartContext.tsx` | سبد فروشگاه/فعال‌سازی |

**ترتیب wrap در App.tsx:** Profile → RegisteredWallets → Cart → Router

### ۶.۵. Utils — `src/utils/` (۲۴ فایل)

| فایل | نقش |
|------|-----|
| `appRoutes.ts` | `isPublicRoute`, `isFullBleedRoute`, `shouldShowMobileBottomNav` |
| `finappThemeSync.ts` | sync theme classes روی body |
| `errorParser.ts` | parse خطاهای wagmi/viem |
| `formatLocaleNumber.ts` | فرمت اعداد locale |
| `edexSwapMath.ts` | محاسبات swap |
| `e1Approval.ts` | approval E1 token |
| `transactionValidation.ts` | validation تراکنش |
| `addressValidation.ts` | validation آدرس |
| `apexChartsTheme.ts` | theme نمودارها |
| `realmStoreProduct.ts` | mapping محصولات realm |
| `activateProductUtils.ts` | utility فعال‌سازی |

### ۶.۶. MyERX — `D:\MyERX`

```
MyERX/
├── src/
│   ├── core/           # ERX, ERouter, EConfigs, EGuard, EDex, UpdateFund
│   ├── interfaces/     # IERX, IEDex, IEConfigs, ...
│   ├── libraries/      # Constants.sol
│   ├── mocks/          # MockERC20
│   └── ERX_V2.sol      # Collector vault
├── script/             # Deploy scripts (Foundry)
├── test/               # Attack tests, migration tests
├── frontend-files/     # ABIs + config + interfaces export
├── deployments/        # output.json (Amoy)
└── broadcast/          # on-chain deployment records
```

### ۶.۷. MyTitan — `D:\MyTitan`

```
MyTitan/
├── src/
│   ├── *.sol           # 15+ core contracts
│   ├── interfaces/     # 20+ interfaces
│   └── libraries/      # Constants, Types, Network, Awards, Arith, TimeDate
├── script/deploy/      # 00_Foundation, 01_CoreModules, 02_SystemConfiguration
├── frontend-files/     # ABIs + config/contracts.ts
└── test/               # Foundry tests
```

---

## ۷. مسیریابی (Routing)

### ۷.۱. Router Type

**HashRouter** — URLها به صورت `/#/path` (مناسب static hosting و Capacitor)

### ۷.۲. Route Shells

| Shell | کلاس | مسیرها |
|-------|------|--------|
| **FullBleedShell** | تمام‌عرض | `/login`, `/public-edex`, `/services`, `/about`, `/contact`, `/ui-test` |
| **InvisibleMobileFrameShell** | ستون ۲۸rem در md+ | بقیه مسیرها |

### ۷.۳. جدول مسیرها

| مسیر | صفحه | Auth | Layout |
|------|------|------|--------|
| `/` | Dashboard | ✅ wallet | — |
| `/MyWallet` | MyWallet | ✅ | Layout |
| `/MyWallet2` | MyWallet2 | ✅ | Layout |
| `/send-money` | SendMoney | ✅ | Layout |
| `/checking-credit` | CheckingCredit | ✅ | Layout |
| `/edex` | EDex | ✅ | Layout |
| `/exchange` | → redirect `/edex` | — | — |
| `/Activate` | Activate | ✅ | Layout |
| `/activate/execution` | ActivateExecution | ✅ | Layout |
| `/checking` | Store Checking | ✅ | Layout |
| `/cards` | Cards | ✅ | Layout |
| `/settings` | Settings | ✅ | — |
| `/store` | Store | ✅ | — |
| `/cart` | Cart | ✅ | — |
| `/product/:id` | ProductDetail | — | — |
| `/nft-details/:id` | NFTDetails | ✅ | — |
| `/ranks` | Ranks | — | — |
| `/my-plan` | MyPlan | ✅ | — |
| `/login` | Login | public | FullBleed |
| `/register` | Register | public | Frame |
| `/public-edex` | PublicEDex | public | FullBleed |
| `/ui-test` | UITest (catalog) | public | FullBleed |
| `/transaction/:id` | TransactionReport | ✅ | Layout |

### ۷.۴. ProtectedRoute

- `requireWallet={true}` → اگر wallet متصل نباشد → redirect به `/login`
- استفاده در ۱۷+ route

### ۷.۵. Redirects

- `/dashboard`, `/wallet`, `/Dashboard` → `/MyWallet` یا `/`
- `/Login`, `/Register` → lowercase
- `*` → `/` (با ProtectedRoute)

---

## ۸. لایه Web3

### ۸.۱. Provider Stack

```
WagmiProvider (config from wagmi.ts)
  └── QueryClientProvider (staleTime: 5min, gcTime: 10min)
        └── RainbowKitProvider (lightTheme, accentColor: #DB2CF5)
              └── App
```

### ۸.۲. Config — `src/config/wagmi.ts`

- **appName:** `E1`
- **chains:** از `networks.ts` (Amoy یا Polygon)
- **transports:** fallback RPC با custom RPC از localStorage
- **wallets:** Trust, SafePal, MetaMask, WalletConnect, Coinbase, ...
- **contracts export:** `{ ...ERX_CONTRACTS, ...TITAN_CONTRACTS, ...TOKENS }`
- **ERC20_ABI inline:** برای `useContractInteraction`

### ۸.۳. الگوهای wagmi

| Hook | ~تعداد فایل | کاربرد |
|------|------------|--------|
| `useReadContract` | ~35 | خواندن state قرارداد |
| `useWriteContract` | ~15 | نوشتن/تراکنش |
| `useAccount` | همه protected pages | آدرس wallet |
| `useWaitForTransactionReceipt` | write flows | انتظار confirm |
| `usePublicClient` | advanced reads | viem client |
| `useBalance` | wallet pages | balance native token |

**Abstraction مرکزی:** `hooks/useContractInteraction.ts` — ERC20 reads/writes

### ۸.۴. Fee Constants (Frontend — باید با قرارداد همخوان باشد)

از `src/config/constants.ts`:

| نوع | درصد | فرمول |
|-----|------|-------|
| Buy | 5% | `amount * 0.95` |
| Sell | 5% | `(ERX * price) * 0.95` |
| Transfer | 7% | `amount * 0.93` |

**Decimals:**
- ERX: 18
- USDT: 6 (testnet mock / mainnet real)
- DAI: 18
- USDC: 6 (mainnet)
- Price (EDex): 18

### ۸.۵. EGuard Penalty

- کاربر penalized → **۲۰٪ burn** روی transfer (نه ۷٪ عادی)
- UI: `EGuardPenaltyBanner` + `useEguardPenalty`
- Rate limit: ≥۱۰ tx در ~۶۵ ثانیه → penalty ۲۴ ساعته

---

## ۹. اکوسیستم MyERX

### ۹.۱. قراردادهای اصلی

| قرارداد | فایل | نقش |
|---------|------|-----|
| **ERX** | `src/core/ERX.sol` | ERC20 — mint (فقط EDex), burn, pause, transfer fees |
| **ERouter** | `src/core/ERouter.sol` | registry آدرس‌ها، DAO (Ownable2Step), syncAll |
| **EConfigs** | `src/core/EConfigs.sol` | fee rates, stablecoin config, timelock ۲ روز |
| **EGuard** | `src/core/EGuard.sol` | anti-spam, rate limit, penalty |
| **EDex** | `src/core/EDex.sol` | bonding curve DEX — buy/sell |
| **UpdateFund** | `src/core/UpdateFund.sol` | vault کارمزد — split به beneficiaries |

### ۹.۲. Router Keys — `Constants.sol`

| Key | Hash | قرارداد |
|-----|------|---------|
| `ERX_KEY` | `keccak256("TOKEN")` | ERX token |
| `EDEX_KEY` | `keccak256("DEX")` | EDex |
| `EGUARD_KEY` | `keccak256("GUARD")` | EGuard |
| `ECONFIGS_KEY` | `keccak256("CONFIGS")` | EConfigs |
| `UPDATE_FUND_KEY` | `keccak256("UPDATE_FUND")` | UpdateFund |
| `DAO_KEY` | `keccak256("DAO")` | owner Router |

### ۹.۳. قوانین اقتصادی ERX

#### Fee Defaults (EConfigs)

| نوع تراکنش | Treasury (bps) | UpdateFund (bps) | مجموع |
|------------|----------------|------------------|-------|
| Buy (0) | 400 (4%) | 100 (1%) | **5%** |
| Sell (1) | 400 (4%) | 100 (1%) | **5%** |
| Transfer (2) | 600 (6%) | 100 (1%) | **7%** |

- **MAX_FEE_BPS:** 2000 (20%) — برای sell penalized
- **DAO timelock:** ۲ روز برای تغییر fee
- **initialPrice:** `1e16` (0.01 USD وقتی supply = 0)

#### Pricing Model (EDex)

```
price = (cachedTotalLiquidity * 1e18) / totalSupply
```

اگر `totalSupply == 0` → `configs.initialPrice()`

#### EGuard Rules

- ≥۱۰ تراکنش در ~۶۵ ثانیه → **penalty ۲۴ ساعته**
- Whitelist → bypass limits
- Penalized user → blocked from transfers
- Penalized sender → **20% burn** (2000 * 1e14)

#### ERX Token Rules

- **Mint:** فقط EDex (`onlyDex`)
- **Burn:** self یا DEX/from
- **Pause:** فقط DAO
- **Transfer:** EGuard.checkTransaction + fee (مگر whitelist یا mint/burn path)

### ۹.۴. آدرس‌های Deploy

#### Polygon Amoy Testnet (chainId 80002)

| قرارداد | آدرس |
|---------|------|
| ERouter | `0x431F4137Ce7860d2fe2E4c1F225AF8c92c57a1aA` |
| ERX | `0x111D252EB63c68727d9f81563394C53C03177111` |
| EConfigs | `0xB9dCa224787B6d1960606D2CaB6e57AE9A0afB1B` |
| EGuard | `0x3E4a29Aae1745b39357905fd8EE941805A711BBc` |
| EDex | `0xFBc7F803b1d01A9848eB8f6bd1D65BE79eade59c` |
| UpdateFund | `0x85f517B78Bf26485dfcD302868B84a0A029A8E43` |
| Mock USDT | `0x9827f46a80b4f7a6F458b66DCaD42963Ad7B64D6` |
| Mock DAI | `0xEF4205228471Ce53778Ee56dD90712D688ECab0a` |

#### Polygon Mainnet (chainId 137) — vanity CREATE2

| قرارداد | آدرس |
|---------|------|
| ERouter | `0x405594f3D8aae1e4186E735ce8589B3a0b1e542A` |
| ERX | `0x1111965A147A72C29a7E6Cc4540731C89A681111` |
| EConfigs | `0x1112Da73C0D3B455A2Cc53D0683561ECeDDfC111` |
| EGuard | `0x1119430C4B315989FAb25AfDAbe82761496EA111` |
| EDex | `0x111F947B68Ea3E8fa16d442e054cb78E75464111` |
| UpdateFund | `0x000017F1fcB890F7845071B3E0DD3cb8937e0000` |

> **توجه:** در `MyDapp1/src/config/erx-contracts.ts` آدرس‌های mainnet هنوز `ZERO_ADDRESS` هستند — باید به‌روز شوند.

---

## ۱۰. اکوسیستم MyTitan

### ۱۰.۱. معماری Router-Centric

همه ماژول‌ها آدرس‌ها را از **Router** (`Router.sol`) با keys در **Constants.sol** resolve می‌کنند.

| قرارداد | فایل | نقش |
|---------|------|-----|
| **Router** | `Router.sol` | registry مرکزی، DAO admin، syncAll |
| **Configs** | `Configs.sol` | پارامترهای اقتصادی (قیمت، cap، duration) |
| **Ledger** | `Ledger.sol` | state DB مشترک: packages, points, weekly shares |
| **Register** | `Register.sol` | binary tree، lifecycle کاربر |
| **Engine** | `Engine.sol` | point relay queue، RFT generation، week pricing |
| **Bank** | `Bank.sol` | خزانه ERX، oracle ERX/USD، payout، smart burn |
| **Activator** | `Activator.sol` | فعال‌سازی پکیج Classic، burn E1 |
| **Manager** | `Manager.sol` | weekly claims (mint E1)، resignation، Monster awards |
| **Panel** | `Panel.sol` | gateway کاربر — delegate writes |
| **Store** | `Store.sol` | marketplace: ERX in → E1 mint |
| **Turbo** | `Turbo.sol` | ERC721 boosters |
| **Lens** | `Lens.sol` | **read-only aggregator** برای UI |
| **E1** | `E1.sol` | توکن داخلی 1:1 USD |
| **AssetMaker** | `AssetMaker.sol` | ERC721 product NFTs |

### ۱۰.۲. Router Keys — Titan Constants

| Key | Hash |
|-----|------|
| `ERX_KEY` | `keccak256(abi.encodePacked("ERX"))` |
| `EDEX_KEY` | `keccak256(abi.encodePacked("EDEX"))` |
| `ENGINE`, `CONFIGS`, `LEDGER`, `MANAGER`, `REGISTER`, `BANK`, `STORE`, ... | |

> **⚠️ تفاوت حیاتی با MyERX:** hash keys متفاوت است! هر Router مستقل است.

### ۱۰.۳. Types — `Types.sol`

| Enum/Struct | مقادیر/فیلدها |
|-------------|---------------|
| **UserStatus** | Free, Active, Inactive, Blocked, Royal, Queen |
| **PackageType** | Classic, VIP, Royal |
| **Groups** | G1–G7 (ladder: G(n) نیاز به G(n-1) active) |
| **Binary tree** | max 2 direct children، depth نامحدود |
| **PointLedger** | rawLeft/Right, paidLeft/Right per user per group |
| **WeeklyData** | totalSharesGenerated, lockedErxForPayout, pricePerShareUSD |

### ۱۰.۴. Configs — پارامترهای Amoy (test — زمان فشرده)

| پارامتر | Testnet | Production |
|---------|---------|------------|
| `oneWeek` | 7 دقیقه | 7 روز |
| `oneDay` | 1 دقیقه | 1 روز |
| Package prices Classic | G1=$10 … G7=$1000 | همان |
| RFT base shares | G1=1 … G7=100 | همان |
| Weekly USD caps Classic | G1=$50 … G7=$10k | همان |
| `lifeFeeBPS` | 1000 (10%) | life fee |
| `packageValidityDuration` | 365 min | ~1 سال |
| `renewalGracePeriod` | 30 min | grace period |
| `rftFloorPrice` / `rftCeilingPrice` | $1 / $3 per share | bands |
| `distributionChainLimit` | 100 | max upline hops |
| Gray penalty | 2× price after grace | whale trap |

### ۱۰.۵. جریان‌های اصلی

#### A. ثبت‌نام
```
User/Panel → Register.register(user, referrer)
  → binary slots validation → User(status=Free)
  → piggyback: Engine.processRelayQueuePublic()
```

#### B. فعال‌سازی پکیج Classic
```
User/Panel → Activator.activatePackage(user, groupIdx)
  → Manager.validateActivationPolicy() [Gray protocol]
  → E1 balance ≥ priceUSD
  → burn E1 (95%) + 5% fee → UPDATE_FUND
  → Ledger: expiry, packageId, weekly E1 revenue
  → upline points → Engine.addRelayTask()
```

#### C. Point → RFT → Weekly → Claim
```
Engine.claimRFTs → shares per week
Engine.finalizeAndPriceWeek → price = E1 revenue / shares (floor/ceiling)
Manager.claimWeeklySharePayout → mint E1 (NOT ERX)
```

#### D. Store — خرید با ERX
```
Store.buyProduct → ERX: user → Store → Bank.deposit()
  → E1 minted: cashback, UPDATE_FUND, creator
  → AssetMaker NFT or Turbo.mintFromStore()
```

#### E. Redeem E1 → ERX
```
Store.redeemE1 → burn E1 (net) + 5% fee
  → Bank.payout(user, netUSD) → ERX at oracle price
```

### ۱۰.۶. Lens — API Read (Frontend باید از Lens بخواند)

| گروه | Functions |
|------|-----------|
| Points & Income | `getPointLedger`, `getUserTotalPendingPoints`, `getUserIncomeCapInfo` |
| User Identity | `getUserInfo`, `getUserBasicInfo`, `getUserTreeInfo`, `getUserFullInfo` |
| Dashboard | `getDashboardFullStats`, `getFullUserStats`, `getUserPackageOverview` |
| Pricing | `getPackagePrice`, `getPackagePriceUSD`, `getErxPriceUsd` |
| Store | `getStoreProducts`, `getStoreProductsPaginated` |
| Turbo | `getUserBoostMultiplier`, `getIsUserVIP` |
| Weekly | `getUserWeeklyStats` |

**الگوی Frontend:** Read → `Lens` | Write → `Panel`

### ۱۰.۷. آدرس‌های Amoy (MyDapp1 config)

| قرارداد | آدرس |
|---------|------|
| Router | `0xb5fd9d359a133C56A2DA64FACab2895cB4667117` |
| Configs | `0xa1Ecc50B2187A8FdDeD1B0CfA32F67edb2B9c035` |
| Ledger | `0x05D9d0279Cf3C0e4bBEa42589FaD45e9D80A4B37` |
| Bank | `0x6264012808423C7B95c6269834fC5EE6A82ccAaa` |
| Store | `0x83316c3a8d5a981246f9f54a368010dDa945E07d` |
| Panel | `0xEe3E79BF496Cc79a857B1d34d352417e71D089eE` |
| Lens | `0x6634CbA86826c16FA9D4De272aA91D3C9825BE63` |
| E1 | `0xe1c2FDF975532A25765cc26273A51E736789d1E1` |
| Register | `0x91Fc32754aA4c37bAFEC3549eB5781142976a666` |
| Engine | `0x50655E1Df16436D981e80d1560DdD32093f2e250` |
| Activator | `0xa0336CDf7EbeEDCba0B76eB26Ce1827818B00d4C` |
| Manager | `0xa28BD7D5494c691FD2527a2CeF49E5FEA1F54CF8` |
| Turbo | `0x52AB6a74eB77F95aE5C6184E3833893B1C50b10f` |
| AssetMaker | `0x21da191e07A5EE6479eB9999C0E622DC2Cf06733` |

---

## ۱۱. نقاط اتصال بین سه پروژه

### ۱۱.۱. ERX ↔ Titan

| نقطه | MyTitan | MyERX |
|------|---------|-------|
| Token interface | `IERX.sol` | `IERX.sol` |
| DEX oracle | `IEDex.getCurrentPrice()` | `EDex.getCurrentPrice()` |
| Bank | `IERX.burn()`, reads EDEX price | — |
| Store | ERX payments via `Constants.ERX_KEY` | — |
| Register | caches `router.getERXToken()` | — |

### ۱۱.۲. Frontend ↔ Contracts

| Frontend Config | Source Project |
|-----------------|----------------|
| `erx-contracts.ts` | MyERX `deployments/output.json` |
| `my-titan-contracts.ts` | MyTitan `frontend-files/config/contracts.ts` |
| `src/abis/*.json` | هر دو `frontend-files/abis/` |

### ۱۱.۳. Sync Workflow

1. Deploy contract در MyERX/MyTitan
2. Export ABI به `frontend-files/abis/`
3. Copy ABI به `MyDapp1/src/abis/`
4. Update addresses در `erx-contracts.ts` / `my-titan-contracts.ts`
5. Titan Router باید آدرس ERX/EDex واقعی را register کند (keys Titan)

### ۱۱.۴. تفاوت Router Keys (بحرانی)

```
MyERX:  ERX_KEY = keccak256("TOKEN")
MyTitan: ERX_KEY = keccak256(abi.encodePacked("ERX"))
```

هر Router مستقل است — auto-link وجود ندارد.

---

## ۱۲. الگوهای معماری

### ۱۲.۱. Dual Styling

- **جدید:** Tailwind + CSS variables (`--finapp-*`, `--app-glass-*`)
- **Legacy:** Bootstrap SCSS + Finapp kit
- **قانون:** UI جدید = Tailwind glass؛ Bootstrap فقط برای modals/tabs legacy

### ۱۲.۲. Code Splitting

Vite manual chunks (`vite.config.ts`):
- `react-vendor`, `router`, `web3-vendor`, `ui-vendor`, `charts`, `utils-vendor`

### ۱۲.۳. Mobile-First Desktop Frame

- موبایل: full width
- دسکتاپ (md+): ستون ۲۸rem مرکزی (`InvisibleMobileFrameShell`)

### ۱۲.۴. Global Send Sheet

`SendActionSheet` یک بار در `Layout` mount می‌شود — نه per-page

### ۱۲.۵. Theme Dual-Shell

- Public routes → cosmic/glass RainbowKit
- App routes → Finapp light/dark (Settings toggle)

### ۱۲.۶. Capacitor-Ready

- PWA manifest
- `base: './'`
- HashRouter
- Mobile wallet detection (`useMobileWallet`)

### ۱۲.۷. Error Handling

- `errorParser.ts` — parse wagmi/viem errors
- `errorTracker.ts` — global error tracking
- `ExchangeErrorBoundary` — E-Dex specific
- `RouteErrorBoundary` — route level

---

## ۱۳. متغیرهای محیطی

| Variable | Default | نقش |
|----------|---------|-----|
| `VITE_NETWORK_MODE` | `testnet` | `testnet` یا `mainnet` |
| `VITE_WALLET_CONNECT_PROJECT_ID` | fallback ID | WalletConnect deep linking |
| `VITE_QBIT_TOKEN_ADDRESS` | — | آدرس QBIT token |

**Custom RPC:** از `localStorage.getItem('CUSTOM_RPC_URL')` در wagmi transports

---

## ۱۴. کاتالوگ UI داخلی

**مسیر:** `/ui-test` (public, FullBleed)

**فایل‌ها:** `src/pages/ui-catalog/` (15 فایل)

| Tab | محتوا |
|-----|-------|
| Overview | نمای کلی design system |
| Typography | Inter weights, RainbowKit typography |
| Buttons/Colors | GlassButton variants, theme colors |
| Badges/Lists | Finapp badges & listviews |
| Cards | Wallet cards, bank cards, Bootstrap cards |
| Charts | ApexCharts placeholders |
| Menus | Sidebar, bottom menu, action sheets |
| Forms/Modals | Forms, dialogs, modals |
| Finalized Proposal | Finapp dark atoms |

**Inventory status:** `active` | `partial` | `removed` | `missing` — در `catalogInventory.ts`

---

## ۱۵. توصیه‌ها برای `.cursorrules`

### ۱۵.۱. اولویت قراردادها

```
ALWAYS prioritize smart contract rules from D:\MyERX and D:\MyTitan.
Never implement frontend logic that contradicts on-chain behavior.
Fee percentages, decimals, and business rules MUST match contract Constants/Configs.
```

### ۱۵.۲. UI Consistency

```
REUSE these components for new pages:
- GlassCard, GlassButton (components/ui/glass/)
- FinappPilledTabs (tabs)
- SwapCard (E-Dex)
- Loader (suspense fallback)
- ProtectedRoute (wallet gating)
- Layout (app shell)
- WalletFlowPageShell (wallet sub-flows)
- Toast (feedback — extend usage beyond EDex)

USE CSS variables from finapp-app-theme.css — never hardcode colors.
Primary brand color: #6236FF (--finapp-primary)
Font: Inter, 15px base, 1.6rem line-height
```

### ۱۵.۳. Web3 Patterns

```
USE wagmi + viem ONLY — no ethers imports in src/
READ: useReadContract via domain hooks or Lens contract
WRITE: useWriteContract via Panel contract (MyTitan) or direct (ERX)
ADDRESSES: import from erx-contracts.ts / my-titan-contracts.ts
ABIs: import JSON from src/abis/ — never inline full ABIs except ERC20_ABI
NETWORK: respect VITE_NETWORK_MODE from networks.ts
```

### ۱۵.۴. Folder Conventions

```
New pages → src/pages/
New hooks → src/hooks/ (domain-grouped)
New ABIs → src/abis/ (sync from MyERX/MyTitan frontend-files)
New config → src/config/
New utils → src/utils/
Types → src/types/
Static data → src/data/
Page CSS → src/styles/{page-name}-page.css
```

### ۱۵.۵. Routing Rules

```
USE HashRouter paths (no BrowserRouter)
USE lazy() + Suspense + Loader for new pages
USE ProtectedRoute requireWallet={true} for authenticated routes
USE Layout wrapper for wallet/edex/activate flows
USE FullBleedShell only for public/marketing pages
```

### ۱�۵.۶. Styling Rules

```
NEW UI: Tailwind + glass utilities (.glass-panel, .glass-button, .dapp-page)
THEME: body.finapp-app-shell + optional .dark-mode
NEVER: create new color palettes — use --finapp-* and --app-* variables
PAGE CSS: only for page-specific layout, not global tokens
```

### ۱۵.۷. MyTitan Integration

```
READ operations → Lens contract (TITAN_CONTRACTS.Lens)
WRITE operations → Panel contract (TITAN_CONTRACTS.Panel)
Package prices → Lens.getPackagePrice() (USD→ERX via Bank.lastErxPrice)
User status → Lens.getUserInfo() / getUserStatusInfo()
NEVER: call Register/Engine/Activator directly from UI unless Panel doesn't expose it
```

### ۱�۵.۸. MyERX Integration

```
Swaps → EDex contract + useEdexSwapQuote hook
Transfers → ERX token + useTransfer + useTransferFeeQuote
Penalties → useEguardPenalty + EGuardPenaltyBanner
Fees → constants.ts MUST match EConfigs on-chain values
Buy/Sell → useEuphoriaExchange hook
```

---

## ۱۶. پیوست — جداول آدرس

### ۱۶.۱. ERX Testnet (Amoy) — منبع: `MyDapp1/src/config/erx-contracts.ts`

```
ERouter:    0x431F4137Ce7860d2fe2E4c1F225AF8c92c57a1aA
ERX:        0x111D252EB63c68727d9f81563394C53C03177111
EConfigs:   0xB9dCa224787B6d1960606D2CaB6e57AE9A0afB1B
EGuard:     0x3E4a29Aae1745b39357905fd8EE941805A711BBc
EDex:       0xFBc7F803b1d01A9848eB8f6bd1D65BE79eade59c
UpdateFund: 0x85f517B78Bf26485dfcD302868B84a0A029A8E43
Mock USDT:  0x9827f46a80b4f7a6F458b66DCaD42963Ad7B64D6
Mock DAI:   0xEF4205228471Ce53778Ee56dD90712D688ECab0a
```

### ۱۶.۲. MyTitan Testnet (Amoy) — منبع: `MyDapp1/src/config/my-titan-contracts.ts`

```
Router:     0xb5fd9d359a133C56A2DA64FACab2895cB4667117
Configs:    0xa1Ecc50B2187A8FdDeD1B0CfA32F67edb2B9c035
Ledger:     0x05D9d0279Cf3C0e4bBEa42589FaD45e9D80A4B37
Bank:       0x6264012808423C7B95c6269834fC5EE6A82ccAaa
Store:      0x83316c3a8d5a981246f9f54a368010dDa945E07d
Panel:      0xEe3E79BF496Cc79a857B1d34d352417e71D089eE
Lens:       0x6634CbA86826c16FA9D4De272aA91D3C9825BE63
E1:         0xe1c2FDF975532A25765cc26273A51E736789d1E1
Register:   0x91Fc32754aA4c37bAFEC3549eB5781142976a666
Engine:     0x50655E1Df16436D981e80d1560DdD32093f2e250
Activator:  0xa0336CDf7EbeEDCba0B76eB26Ce1827818B00d4C
Manager:    0xa28BD7D5494c691FD2527a2CeF49E5FEA1F54CF8
Turbo:      0x52AB6a74eB77F95aE5C6184E3833893B1C50b10f
AssetMaker: 0x21da191e07A5EE6479eB9999C0E622DC2Cf06733
```

### ۱۶.۳. ERX Mainnet (Polygon) — deployed, DApp not yet configured

```
ERouter:    0x405594f3D8aae1e4186E735ce8589B3a0b1e542A
ERX:        0x1111965A147A72C29a7E6Cc4540731C89A681111
EConfigs:   0x1112Da73C0D3B455A2Cc53D0683561ECeDDfC111
EGuard:     0x1119430C4B315989FAb25AfDAbe82761496EA111
EDex:       0x111F947B68Ea3E8fa16d442e054cb78E75464111
UpdateFund: 0x000017F1fcB890F7845071B3E0DD3cb8937e0000
```

---

## نتیجه‌گیری

این سه پروژه یک اکوسیستم یکپارچه **E.ONE** را تشکیل می‌دهند:

1. **MyERX** — لایه توکن و DEX با قوانین fee/penalty سخت‌گیرانه
2. **MyTitan** — لایه DeFi/MLM با binary tree، ۷ گروه، E1/ERX economics
3. **MyDapp1** — frontend React با معماری hybrid styling و wagmi-native Web3

**برای حفظ consistency:**
- قراردادها = source of truth
- Glass design system = UI standard
- Lens (read) + Panel (write) = Titan integration pattern
- wagmi/viem = sole Web3 library
- CSS variables = sole color source

---

*این گزارش برای استفاده در تهیه `.cursorrules` و onboarding توسعه‌دهندگان تهیه شده است.*
