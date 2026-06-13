# Finapp v2-2-2 — گزارش موجودی و نقشه‌برداری (Inventory Blueprint)

**نقش:** Dr. Satoshi، معمار ارشد Web3 و Frontend  
**منبع اسکن:** `D:\Titan_Archive\MyDapps\themeforest-Dtvp5iS0-finapp-wallet-banking-html-mobile-template\Finapp v2-2-2`  
**پروژه مقصد:** `D:\MyDapp1` (React + Vite + Tailwind PWA)  
**نسخه قالب:** Finapp v2.2.2 (base.js گزارش v2.2.1)  
**تاریخ اسکن:** ۳ ژوئن ۲۰۲۶

---

## خلاصه اجرایی

Finapp v2-2-2 یک قالب HTML موبایل‌اول مبتنی بر **Bootstrap 5** است که **۶۷ صفحه HTML**، یک **CSS bundle واحد** (~۱۴۶ KB)، یک **فایل JS مرکزی** (`base.js` ~۲۳ KB) و مجموعه‌ای از **کامپوننت‌های UI از پیش ساخته** ارائه می‌دهد. قالب دو خط محصول دارد: **Banking/Wallet کلاسیک** (`index.html`) و **Crypto Wallet** (`crypto-*.html`).

**نکته مهم:** پروژه `MyDapp1` **از قبل بخش قابل توجهی از Finapp را ادغام کرده** — SCSS، `style.css`، layoutها و بخشی از منطق `base.js` در `src/utils/appInitialization.ts` وجود دارد. این گزارش هم موجودی خام قالب را فهرست می‌کند و هم وضعیت فعلی پروژه را برای تصمیم‌گیری دقیق‌تر نشان می‌دهد.

---

## ۱. نقشه دارایی‌ها (Asset Topography)

### ۱.۱ ساختار پوشه‌ای ریشه

```
Finapp v2-2-2/
├── Documentation/          ← مستندات HTML + لایسنس پلاگین‌ها
└── HTML/                   ← محتوای اجرایی قالب
    ├── *.html              ← 67 صفحه
    ├── __manifest.json     ← PWA manifest
    ├── __service-worker.js ← Service Worker
    └── assets/
        ├── css/
        │   ├── style.css           ← CSS کامپایل‌شده نهایی
        │   └── src/
        │       ├── bootstrap/bootstrap.min.css
        │       └── splide/splide.min.css
        ├── sass/                   ← منبع SCSS (قابل ویرایش)
        ├── js/
        │   ├── base.js               ← منطق مرکزی Vanilla JS
        │   ├── lib/bootstrap.bundle.min.js
        │   └── plugins/
        │       ├── apexcharts/apexcharts.min.js
        │       └── splide/splide.min.js
        └── img/                      ← 47 فایل (icon, sample, logo, favicon)
```

### ۱.۲ فایل‌های CSS اصلی

| فایل | مسیر | نقش | اندازه تقریبی |
| --- | --- | --- | --- |
| **style.css** | `HTML/assets/css/style.css` | خروجی نهایی کامپایل SCSS — شامل Bootstrap + Splide + Ionicons + تمام UI Finapp | ~146 KB |
| **bootstrap.min.css** | `HTML/assets/css/src/bootstrap/` | Bootstrap 5 Reboot + Components | bundled در style.css |
| **splide.min.css** | `HTML/assets/css/src/splide/` | استایل Carousel/Slider | bundled در style.css |
| **style.scss** | `HTML/assets/sass/style.scss` | نقطه ورود SCSS — import زنجیره‌ای | منبع |

#### زنجیره import در `style.scss`

```
bootstrap.min.css
  → splide.min.css
  → ionicons (CDN CSS)
  → font (_font.scss)
  → variables (_variables.scss)
  → body (_body.scss)
  → layout/ (header, bottomMenu, content, sidebar, footer)
  → ui/ (_ui.scss — 32 ماژول UI)
  → blocks (_blocks.scss — بلوک‌های صفحه)
  → rtl (_rtl.scss)
  → darkmode (_darkmode.scss)
```

### ۱.۳ پیکربندی Dark Mode

Dark Mode در Finapp **کلاس‌محور** است، نه `prefers-color-scheme` به‌تنهایی.

| لایه | فایل | مکانیزم |
| --- | --- | --- |
| **متغیرهای رنگ** | `assets/sass/_variables.scss` | `$darkmode_bodyBackground`, `$darkmode_contentBackground`, `$darkmode_colorHeading`, `$darkmode_colorText`, `$darkmode_colorLight`, `$darkmode_colorLine` |
| **استایل‌های override** | `assets/sass/_darkmode.scss` | ~900 خط override زیر `body.dark-mode { ... }` برای header، bottom menu، listview، card، modal، input، table، toast و... |
| **Toggle UI** | `form-check form-switch` + کلاس `.dark-mode-switch` | checkbox Bootstrap با استایل Finapp |
| **منطق JS** | `assets/js/base.js` (خطوط 502–563) | toggle کلاس `dark-mode` روی `<body>` + ذخیره در `localStorage` با کلید `FinappDarkmode` |
| **تنظیمات پیش‌فرض** | آبجکت `Finapp.Dark_Mode` در `base.js` | `default`, `local_mode` (ساعت شب/روز), `auto_detect` (prefers-color-scheme) |

**پالت Dark Mode پیش‌فرض Finapp:**

| Token | مقدار |
| --- | --- |
| `$darkmode_bodyBackground` | `#030108` |
| `$darkmode_contentBackground` | `#161129` |
| `$darkmode_colorHeading` | `#FFFFFF` |
| `$darkmode_colorText` | `#8f82a5` |
| `$darkmode_colorLight` | `#69587f` |
| `$darkmode_colorLine` | `#2d1f3b` |

**پالت Light Mode (برای مقایسه):**

| Token | مقدار |
| --- | --- |
| `$colorPrimary` | `#6236FF` |
| `$bodyBackground` | `#EDEDF5` |
| `$colorHeading` | `#27173E` |

> **توجه:** پالت Titan UI پروژه (`#02071A`, `#D7E8F7`, `#5B38DA`) با پالت Finapp متفاوت است. Dark Mode Finapp **قابل reuse از نظر ساختار** است، اما **رنگ‌ها باید override شوند**.

### ۱.۴ ماژول‌های SCSS — Layout

| فایل | کلاس‌های کلیدی |
| --- | --- |
| `layout/_header.scss` | `.appHeader`, `.headerButton`, `.pageTitle`, `.extraHeader` |
| `layout/_bottomMenu.scss` | `.appBottomMenu`, `.item`, `.item.active` |
| `layout/_content.scss` | `#appCapsule`, `.section`, `.wide-block`, `.content-hero` |
| `layout/_sidebar.scss` | `.panelbox`, `#sidebarPanel`, `.profileBox`, `.sidebar-balance`, `.action-group` |
| `layout/_footer.scss` | `.appFooter` |

### ۱.۵ ماژول‌های SCSS — UI Kit (`ui/`)

| فایل | کامپوننت |
| --- | --- |
| `_listview.scss` | `.listview`, `.listview-title`, `.image-listview`, `.simple-listview` |
| `_actionsheet.scss` | `.action-sheet`, `.action-sheet-content` |
| `_dialog.scss` | `.dialogbox` |
| `_modal.scss` | `.modal`, `.panelbox` |
| `_toast.scss` | `.toast-box` |
| `_notification.scss` | `.notification-box`, `.notification-dialog` |
| `_checkbox-radio-toggle.scss` | `.form-check-switch`, toggle styles |
| `_inputs.scss` | `.form-group.basic`, `.input-wrapper`, `.clear-input` |
| `_tabs.scss` | `.nav-tabs.lined` |
| `_carousel.scss` | `.carousel-full`, `.carousel-single`, ... |
| `_login.scss` | استایل صفحات auth |
| `_addtohome.scss` | Add to Home Screen |
| `_cookiesbox.scss` | Cookies consent offcanvas |
| `_loader.scss` | `#loader`, `.loading-icon` |
| + 18 ماژول دیگر | badge, button, card, accordion, alert, chips, dropdown, grid, image, messages, panel, progressbar, search, table, timeline, tooltip, typography, color-class |

### ۱.۶ ماژول SCSS — Blocks (بلوک‌های صفحه)

| کلاس | کاربرد |
| --- | --- |
| `.wallet-card-section` / `.wallet-card` | کارت موجودی Dashboard |
| `.transactions` | لیست تراکنش‌ها |
| `.avatar-section` | پروفایل Settings |
| `.bill-box` | کارت قبض |
| `.coinbox` / `.coin-chart` | Crypto portfolio |
| `.exchange-group` | صفحه Exchange |
| `.gradientSection` | هدر gradient Crypto |
| `.listed-detail` | جزئیات تراکنش |
| `.splash-page` | Splash screen |
| `.transfer-verification` | OTP/Verification |
| `.card-block` | کارت فیزیکی/مجازی |

### ۱.۷ کتابخانه‌های JavaScript

| کتابخانه | مسیر | نسخه/منبع | استفاده |
| --- | --- | --- | --- |
| **Bootstrap Bundle** | `assets/js/lib/bootstrap.bundle.min.js` | Bootstrap 5 (شامل Popper) | Modal, Offcanvas, Tooltip, Tab, Collapse |
| **base.js** | `assets/js/base.js` | Finapp v2.2.1 | منطق مرکزی قالب (نگاه کنید بخش ۱.۸) |
| **Splide** | `assets/js/plugins/splide/splide.min.js` | Splide 4.x | Carousel/Slider |
| **ApexCharts** | `assets/js/plugins/apexcharts/apexcharts.min.js` | ApexCharts | نمودارها — **فقط در صفحات crypto و component-charts** |
| **Service Worker** | `__service-worker.js` | PWA caching | ثبت در base.js اگر `Finapp.PWA.enable = true` |

#### ۱.۸ مسئولیت‌های `base.js` (نقاط حساس برای React)

| بخش | خطوط تقریبی | رفتار | ریسک Virtual DOM |
| --- | --- | --- | --- |
| PWA Service Worker | 67–73 | `navigator.serviceWorker.register` | پایین (یک‌بار) |
| Page Loader | 80–85 | fade out `#loader` | متوسط |
| Go Back Animation | 91–109 | `body.animationGoBack` + `history.go(-1)` | **بالا** — React Router conflict |
| RTL | 115–126 | تغییر `html[dir]` و sidebar | متوسط |
| Bootstrap Tooltips | 131–135 | `new bootstrap.Tooltip(...)` | **بالا** — DOM re-render |
| Fix # href | 142–147 | `preventDefault` روی همه `a[href*="#"]` | **بالا** — modal/link conflict |
| Form Input helpers | 154–187 | focus/blur/clear-input | **بالا** |
| Searchbox Toggle | 193–206 | toggle class `.show` | متوسط |
| Splide Carousels | 213–314 | mount روی `.carousel-*` | **بالا** — re-mount on re-render |
| File Upload preview | 320–340 | تغییر DOM label | **بالا** |
| Notification/Toast | 346–423 | toggle class `.show` | متوسط — قابل Reactify |
| Add to Home | 428–497 | Bootstrap Modal + localStorage | متوسط |
| **Dark Mode** | 502–563 | toggle `body.dark-mode` + sync switches | **متوسط** — Settings.tsx از قبل React state دارد |
| Cookies Box | 568–595 | Bootstrap Offcanvas | متوسط |
| Test Mode | 603–709 | keyboard listener + DOM injection | **بالا** |

> **نتیجه:** `base.js` را **نباید به‌صورت global در React SPA import کرد**. پروژه `MyDapp1` این کار را **درست انجام داده** و فقط بخش‌های امن را در `appInitialization.ts` استخراج کرده.

### ۱.۹ مجموعه آیکن‌ها

| سیستم | منبع | نحوه بارگذاری |
| --- | --- | --- |
| **Ionicons CSS (v4.5.10-0)** | CDN در `style.scss` | `@import url('https://unpkg.com/ionicons@4.5.10-0/dist/css/ionicons.min.css')` |
| **Ionicons ESM (latest)** | CDN در `<script>` هر HTML | `<script type="module" src="https://cdn.jsdelivr.net/npm/ionicons@latest/dist/ionicons/ionicons.esm.js">` |
| **Bootstrap Icons** | — | **استفاده نمی‌شود** |
| **Font Awesome** | — | **استفاده نمی‌شود** |

**نحوه استفاده در HTML:** `<ion-icon name="settings-outline"></ion-icon>`

> **هشدار نسخه:** SCSS از Ionicons **v4.5.10-0** (CSS) استفاده می‌کند، اما HTML صفحات از **@latest ESM** استفاده می‌کنند. این ناسازگاری بالقوه در React باید با **یک سیستم آیکن واحد** (پیشنهاد: `lucide-react` که در MyDapp1 موجود است) حل شود.

### ۱.۱۰ فونت

| فونت | منبع | فایل |
| --- | --- | --- |
| **Poppins** (400, 500, 600, 700) | Google Fonts CDN | `_font.scss` |

> MyDapp1 از **Inter Tight** استفاده می‌کند (`index.css`). فونت Finapp **نیازی به import ندارد** مگر برای preview دقیق.

### ۱.۱۱ دارایی‌های تصویری (`assets/img/`)

| پوشه | محتوا | تعداد |
| --- | --- | --- |
| `icon/` | PWA icons (72–512px) | 8 |
| `sample/avatar/` | آواتار نمونه | ~10 |
| `sample/brand/` | لوگوی برند نمونه | ~5 |
| `sample/photo/` | تصاویر نمونه | ~10 |
| ریشه | `favicon.png`, `logo.png`, `loading-icon.png` | 3+ |

### ۱.۱۲ PWA

| فایل | محتوا |
| --- | --- |
| `__manifest.json` | name: Finapp, display: standalone, orientation: portrait, theme/background: #000000 |
| `__service-worker.js` | cache-first برای assets |

---

## ۲. فهرست صفحات کلیدی (Core Pages Inventory)

### ۲.۱ نگاشت Phase 1 → HTML Finapp

| نیاز Phase 1 | صفحه(های) Finapp | مسیر | اولویت | صفحه React مقصد در MyDapp1 |
| --- | --- | --- | --- | --- |
| **Landing / Splash** | `app-splash.html` | HTML/ | P1 | — (فعلاً ندارد) |
| | `app-splash-image.html` | HTML/ | P1-alt | — |
| | `index.html` | HTML/ | P2 (Banking) | `Dashboard.tsx` |
| | `crypto-index.html` | HTML/ | **P1 (Web3)** | `MyWallet2.tsx` / `Dashboard.tsx` |
| **Registration / Login** | `app-login.html` | HTML/ | P1 | `pages/public/Login.tsx` |
| | `app-register.html` | HTML/ | P1 | `pages/public/Register.tsx` |
| | `app-forgot-password.html` | HTML/ | P2 | — |
| | `app-sms-verification.html` | HTML/ | P2 | — |
| **Wallet / Dashboard** | `index.html` | HTML/ | P1 | `Dashboard.tsx` |
| | `crypto-index.html` | HTML/ | **P1** | `MyWallet2.tsx` |
| | `crypto-portfolio.html` | HTML/ | P1 | `MyWallet.tsx` |
| | `app-cards.html` | HTML/ | P2 | `Cards.tsx` |
| | `app-savings.html` | HTML/ | P3 | — |
| **Transactions** | `app-transactions.html` | HTML/ | P1 | `TransactionReport` / history |
| | `app-transaction-detail.html` | HTML/ | P1 | — |
| | `app-transaction-verification.html` | HTML/ | P2 | — |
| | `crypto-transactions.html` | HTML/ | P1 | — |
| **Settings** | `app-settings.html` | HTML/ | **P1** | `Settings.tsx` (موجود) |
| **Exchange (Web3 bonus)** | `crypto-exchange.html` | HTML/ | P1 | `EDex.tsx` |
| | `crypto-coin-detail.html` | HTML/ | P2 | `NFTDetails.tsx` (الگو) |

### ۲.۲ جزئیات صفحات Phase 1

#### `app-settings.html` — مرجع Settings
- **ساختار:** `appHeader` → `#appCapsule` → `avatar-section` → گروه‌های `listview-title` + `listview`
- **بخش‌ها:** Theme (Dark Mode), Notifications, Profile Settings, Security
- **کامپوننت‌ها:** `form-check-switch`, `image-listview`, `inset`, `text`
- **Bottom Menu:** `.appBottomMenu` با 5 آیتم (Settings = active)
- **اسکریپت‌ها:** bootstrap.bundle → ionicons ESM → splide → base.js

#### `crypto-index.html` — مرجع Wallet/Dashboard Web3
- **ساختار:** header با avatar → `gradientSection` (balance) → portfolio list → action buttons → charts (ApexCharts)
- **بلوک‌ها:** `.coinbox`, `.wallet-inline-button`, `.exchange-group`
- **وابستگی JS:** ApexCharts + Splide + base.js

#### `app-login.html` / `app-register.html`
- **ساختار:** transparent header → فرم در `.card` → `.form-group.basic`
- **ویژگی:** `clear-input`, validation visual states
- **هدایت:** action به `index.html`

#### `app-splash.html`
- **ساختار:** fullscreen splash → دکمه CTA → redirect
- **بلوک:** `.splash-page`

#### `app-transactions.html` / `app-transaction-detail.html`
- **ساختار:** listview-based transaction list → detail با `.listed-detail` + `.simple-listview`
- **الگو:** key-value rows برای status, amount, date

### ۲.۳ فهرست کامل 67 صفحه HTML

<details>
<summary>کلیک برای مشاهده</summary>

**App Pages (24):** app-404, app-about, app-bills, app-blog, app-blog-post, app-cards, app-components, app-contact, app-faq, app-forgot-password, app-login, app-notification-detail, app-notifications, app-pages, app-qr-code, app-register, app-savings, app-settings, app-sms-verification, app-splash, app-splash-image, app-transaction-detail, app-transactions, app-transaction-verification

**Crypto Pages (5):** crypto-index, crypto-coin-detail, crypto-exchange, crypto-portfolio, crypto-transactions

**Component Demos (37):** component-accordion, component-action-sheet, component-add-to-home, component-alert, component-appbottommenu, component-appheader, component-badge, component-button, component-card, component-carousel, component-charts, component-checkbox, component-chips, component-contentbox, component-cookies-box, component-dialog, component-dropdown, component-fullpage-slider, component-grid, component-icons, component-images, component-inputs, component-listview, component-messages, component-modal-and-panels, component-notification, component-preloader, component-progressbar, component-radio, component-search, component-table, component-tabs, component-timeline, component-toast, component-toggle, component-tooltips, component-typography

**Root:** index.html

</details>

### ۲.۴ صفحات مرجع Component (برای استخراج UI)

| فایل مرجع | برای استخراج |
| --- | --- |
| `component-listview.html` | Settings rows, menu items |
| `component-action-sheet.html` | Deposit/Withdraw/Send sheets |
| `component-appbottommenu.html` | Bottom navigation |
| `component-appheader.html` | Page header variants |
| `component-toggle.html` | Switch/toggle |
| `component-toast.html` | Toast notifications |
| `component-notification.html` | Push-style notifications |
| `component-dialog.html` | Confirm dialogs |
| `component-modal-and-panels.html` | Sidebar panel |
| `component-inputs.html` | Form fields |
| `component-charts.html` | ApexCharts integration |

---

## ۳. کامپوننت‌های آماده (Available UI Components)

### ۳.۱ طبقه‌بندی: چه چیزی «مستقیم» قابل reuse است؟

| لایه | Reuse مستقیم؟ | توضیح |
| --- | --- | --- |
| **CSS Classes / SCSS** | ✅ بله (با فیلتر) | کلاس‌های `.listview`, `.appHeader`, `.toast-box` و... |
| **تصاویر / Icons** | ✅ بله | PNG/SVG samples, PWA icons |
| **HTML Structure** | ⚠️ به‌عنوان مرجع | باید به JSX تبدیل شود |
| **Bootstrap JS behaviors** | ❌ نه | Modal/Tab/Tooltip باید React-native شوند |
| **base.js behaviors** | ❌ نه | DOM manipulation با React conflict دارد |
| **Ionicons `<ion-icon>`** | ❌ توصیه نمی‌شود | جایگزین با lucide-react |

### ۳.۲ فهرست کامل 37 کامپوننت UI

| # | کامponنت Finapp | کلاس/الگوی HTML | JS وابسته | صفحه مرجع | توصیه Reuse |
| --- | --- | --- | --- | --- | --- |
| 1 | App Header | `.appHeader` | — | component-appheader | CSS ✅ / JSX جدید |
| 2 | Bottom Menu | `.appBottomMenu` | — | component-appbottommenu | CSS ✅ — `MobileBottomNav` موجود |
| 3 | Sidebar Panel | `.panelbox`, `#sidebarPanel` | Bootstrap Modal | component-modal-and-panels | CSS ✅ / Logic React |
| 4 | Action Sheet | `.action-sheet` | Bootstrap Modal | component-action-sheet | CSS ✅ / Logic React |
| 5 | Dialog Box | `.dialogbox` | Bootstrap Modal | component-dialog | CSS ✅ / Logic React |
| 6 | Toast | `.toast-box` | base.js `toastbox()` | component-toast | CSS ✅ / Hook React |
| 7 | Notification | `.notification-box` | base.js `notification()` | component-notification | CSS ✅ / Hook React |
| 8 | List View | `.listview` | — | component-listview | **CSS ✅✅** — Settings core |
| 9 | Switch/Toggle | `.form-check-switch` | base.js (dark mode) | component-toggle | CSS ✅ / State React |
| 10 | Accordion | `.accordion` | Bootstrap Collapse | component-accordion | CSS / React state |
| 11 | Alert | `.alert` | — | component-alert | CSS ✅ |
| 12 | Badge | `.badge` | — | component-badge | CSS ✅ |
| 13 | Button | `.btn` | — | component-button | CSS ⚠️ — Tailwind preferred |
| 14 | Card | `.card` | — | component-card | CSS ✅ |
| 15 | Carousel | `.carousel-*` | Splide | component-carousel | CSS ✅ / `@splidejs/react-splide` |
| 16 | Charts | `.chart-*` | ApexCharts | component-charts | npm `apexcharts` + `react-apexcharts` |
| 17 | Checkbox/Radio | `.form-check` | — | component-checkbox/radio | CSS ✅ |
| 18 | Chips | `.chip` | — | component-chips | CSS ✅ |
| 19 | Content Box | `.wide-block` | — | component-contentbox | CSS ✅ |
| 20 | Cookies Box | `.offcanvas` | Bootstrap Offcanvas | component-cookies-box | CSS / React |
| 21 | Dropdown | `.dropdown` | Bootstrap Dropdown | component-dropdown | React component |
| 22 | Fullpage Slider | `.carousel-full` | Splide | component-fullpage-slider | React Splide |
| 23 | Grid | `.row`, `.col-*` | — | component-grid | ⚠️ Tailwind grid preferred |
| 24 | Icons | `<ion-icon>` | Ionicons ESM | component-icons | ❌ → lucide-react |
| 25 | Images | `.imaged`, `.image-listview` | — | component-images | CSS ✅ |
| 26 | Inputs | `.form-group.basic` | base.js clear-input | component-inputs | CSS ✅ / Logic React |
| 27 | Messages | `.message-item` | — | component-messages | CSS ✅ |
| 28 | Preloader | `#loader` | base.js fade | component-preloader | CSS ✅ / React Loader موجود |
| 29 | Progress Bar | `.progress` | — | component-progressbar | CSS ✅ |
| 30 | Search | `#search`, `.toggle-searchbox` | base.js | component-search | CSS / React state |
| 31 | Table | `.table` | — | component-table | CSS ✅ |
| 32 | Tabs | `.nav-tabs.lined` | Bootstrap Tab | component-tabs | CSS ✅ / React tabs |
| 33 | Timeline | `.timeline` | — | component-timeline | CSS ✅ |
| 34 | Tooltips | `[data-bs-toggle="tooltip"]` | Bootstrap Tooltip | component-tooltips | React tooltip lib |
| 35 | Typography | heading styles | — | component-typography | CSS tokens |
| 36 | Add to Home | `#ios-add-to-home-screen` | base.js + Bootstrap Modal | component-add-to-home | `PwaPrompt` موجود |
| 37 | Wallet Blocks | `.wallet-card`, `.coinbox` | — | index.html, crypto-* | CSS ✅ — blocks.scss |

### ۳.۳ Action Sheets آماده در `index.html` (Dashboard)

این modal/action-sheetها در Dashboard Banking از قبل ساخته شده‌اند:

- `#depositActionSheet`
- `#withdrawActionSheet`
- `#sendActionSheet`
- `#exchangeActionSheet`

> برای Web3، `crypto-index.html` و `crypto-exchange.html` الگوهای مناسب‌تری هستند.

---

## ۴. استراتژی ادغام (Integration Path)

### ۴.۱ وضعیت فعلی MyDapp1 (Baseline)

پروژه **از قبل** Finapp را partial integrate کرده:

| دارایی Finapp | وضعیت در MyDapp1 | مسیر |
| --- | --- | --- |
| `style.css` (compiled) | ✅ import شده | `src/assets/css/style.css` via `src/styles/style.scss` |
| SCSS modules (layout, ui, blocks, darkmode) | ✅ mirror شده | `src/styles/` + `src/assets/sass/` |
| Bootstrap CSS | ✅ via npm | `bootstrap/dist/css/bootstrap.min.css` |
| Splide CSS | ✅ CDN | در style.scss |
| Ionicons CSS | ✅ CDN | در style.scss |
| `base.js` | ⚠️ **جایگزین شده** | `src/utils/appInitialization.ts` (subset) |
| Tailwind | ✅ primary engine | `src/styles/tailwind.css` |
| Dark mode | ⚠️ dual system | Finapp `body.dark-mode` + Settings React state |
| `#appCapsule` override | ✅ transparent | `src/index.css` |

### ۴.2 اصل طلایی: CSS-First, Logic-React

```
┌─────────────────────────────────────────────────────┐
│  Finapp HTML/CSS  ──→  مرجع بصری + کلاس‌های CSS    │
│  Finapp base.js   ──→  ❌ import نشود               │
│  Bootstrap JS     ──→  ❌ global import نشود        │
│  رفتار UI         ──→  React state/hooks/effects    │
└─────────────────────────────────────────────────────┘
```

### ۴.۳ مراحل ادغام گام‌به‌گام

#### مرحله 0: Sync دارایی‌ها از آرشیو Titan

```text
منبع:  D:\Titan_Archive\...\Finapp v2-2-2\HTML\assets\
مقصد:  D:\MyDapp1\src\assets\finapp\   (پوشه جدید، مرتب)
```

| Copy | توضیح |
| --- | --- |
| `assets/img/icon/*` | PWA icons (اگر جایگزین manifest شوند) |
| `assets/img/sample/*` | placeholder images |
| `assets/sass/*` | **فقط اگر** قصد rebuild SCSS دارید — فعلاً mirror موجود است |
| `assets/css/style.css` | diff با نسخه فعلی MyDapp1 — sync اگر v2-2-2 جدیدتر است |

> **اقدام فوری:** diff بین `Finapp v2-2-2/HTML/assets/css/style.css` و `MyDapp1/src/assets/css/style.css` برای شناسایی تغییرات v2.2.2.

#### مرحله 1: CSS — import کنترل‌شده (بدون conflict)

**وضعیت فعلی `src/styles/style.scss`:**

```scss
@import 'bootstrap/dist/css/bootstrap.min.css';   // ⚠️ Preflight conflict با Tailwind
@import '../assets/css/style.css';                 // ✅ Finapp compiled
@import 'darkmode';                                // ✅ Dark mode overrides
```

**توصیه:**

1. Bootstrap CSS را **scoped** نگه دارید — فقط برای legacy modals تا Phase 4.
2. `style.css` Finapp را import کنید — **اما** `#appCapsule { background: transparent }` override فعلی را حفظ کنید.
3. Dark mode: `_darkmode.scss` را نگه دارید تا Titan palette override شود (مرحله 2).
4. **هرگز** `base.js` را در `index.html` یا `main.tsx` import نکنید.

#### مرحله 2: Token Override — Titan Palette روی Finapp

در `src/styles/_variables.scss` (یا فایل جدید `_titan-overrides.scss`):

```scss
// Override Finapp dark mode tokens → Titan Cosmic
$darkmode_bodyBackground: #02071A;
$darkmode_contentBackground: rgba(215, 232, 247, 0.06);
$colorPrimary: #5B38DA;
// ... سپس re-import darkmode overrides
```

این رویکرد **CSS reuse** را حفظ می‌کند بدون rewrite کامل.

#### مرحله 3: JS — فقط Subset امن در React

| رفتار Finapp | پیاده‌سازی React | فایل |
| --- | --- | --- |
| Dark mode toggle | `useState` + `document.body.classList` | `Settings.tsx` (موجود) |
| Go back | `useNavigate(-1)` | `PageLayout.tsx` (موجود) |
| Page loader | `<Loader />` component | موجود |
| Toast/Notification | Custom hook `useToast()` | **جدید** |
| Action Sheet | `<BottomSheet>` + state | **جدید** |
| Splide Carousel | `@splidejs/react-splide` | npm (بهتر از base.js mount) |
| ApexCharts | `react-apexcharts` | npm — فقط صفحات chart |
| PWA Add to Home | `<PwaPrompt />` | موجود |
| Tooltips | `@radix-ui/react-tooltip` یا CSS-only | **جدید** |

**`appInitialization.ts` — نگه دارید، گسترش ندهید به DOM-heavy logic.**

#### مرحله 4: جلوگیری از Virtual DOM Conflicts

| Conflict | علت | راه‌حل |
| --- | --- | --- |
| `animationGoBack` صفحه blank | `body.animationGoBack` hides `#appCapsule` | ✅ `RouteAnimationCleanup` در `App.tsx` (موجود) |
| Modal double-init | Bootstrap Modal + React re-render | Controlled modal با React state؛ `data-bs-toggle` حذف |
| Tooltip orphan | Bootstrap Tooltip روی DOM حذف‌شده | `useEffect` cleanup یا CSS-only |
| Splide duplicate mount | base.js + React both mount | فقط `@splidejs/react-splide` |
| `# href` preventDefault | base.js blocks hash links | React `onClick` handlers — base.js import نشود |
| Dark mode desync | Finapp localStorage + React state | **یک منبع ح truth:** React state → body class |
| Bootstrap + Tailwind Preflight | double reset | `@tailwind base` + Bootstrap: استفاده `@layer` scoping یا `prefix` |

#### مرحله 5: Port صفحات Phase 1 (ترتیب پیشنهادی)

| # | Finapp Source | React Target | روش |
| --- | --- | --- | --- |
| 1 | `app-settings.html` | `Settings.tsx` | JSX + Finapp CSS classes + Tailwind tokens |
| 2 | `crypto-index.html` | `MyWallet2.tsx` | ✅ در حال انجام — ادامه blocks |
| 3 | `app-login.html` | `Login.tsx` | Form components |
| 4 | `app-register.html` | `Register.tsx` | Form components |
| 5 | `app-transactions.html` | Transaction list | ListView component |
| 6 | `app-splash.html` | Splash route (new) | Fullscreen page |
| 7 | `crypto-exchange.html` | `EDex.tsx` | Exchange blocks |

#### مرحله 6: چک‌لیست QA پس از هر Port

- [ ] صفحه بدون `base.js` render می‌شود
- [ ] Dark mode toggle sync است
- [ ] Bottom nav active state درست است
- [ ] Modal/Sheet با React controlled است
- [ ] `#appCapsule` transparent است (no white flash)
- [ ] Safe-area padding (`env(safe-area-inset-*)`) رعایت شده
- [ ] Tailwind + Finapp CSS conflict ندارد (inspect computed styles)
- [ ] `npm run build` بدون error

### ۴.۴ ماتریس تصمیم — چه چیزی Port شود؟

| دارایی | Port? | دلیل |
| --- | --- | --- |
| `style.css` / SCSS modules | ✅ | پایه visual — already in project |
| `_darkmode.scss` | ✅ (با override) | ساختار dark theme |
| `_blocks.scss` (wallet, coinbox) | ✅ | Dashboard/Wallet blocks |
| `base.js` (کامل) | ❌ | Virtual DOM conflict |
| Bootstrap JS | ❌ | React alternatives |
| Ionicons | ❌ | lucide-react preferred |
| ApexCharts | ⚠️ | فقط اگر chart لازم — via react-apexcharts |
| Splide (vanilla) | ⚠️ | prefer react-splide |
| Sample images | ✅ | placeholders |
| PWA manifest/icons | ⚠️ | merge با manifest فعلی Vite PWA |
| Banking `index.html` | ⚠️ | crypto-index برای Web3 بهتر است |
| All 37 component demos | ❌ | فقط به‌عنوان مرجع |

---

## ۵. جمع‌بندی و توصیه نهایی Dr. Satoshi

Finapp v2-2-2 یک **UI kit CSS غنی** است، نه یک SPA framework. بیشترین ارزش آن در **کلاس‌های CSS، بلوک‌های SCSS، و HTML reference** است — نه در `base.js`.

**برای Phase 1:**

1. **`app-settings.html`** → مرجع اصلی Settings (listview + switch + avatar-section)
2. **`crypto-index.html`** → مرجع Wallet/Dashboard Web3
3. **`app-login.html` / `app-register.html`** → مرجع Auth
4. **`app-transactions.html`** → مرجع Transaction list
5. **Component demos** → مرجع isolated برای Action Sheet, Toast, Dialog

**آنچه import نشود:**

- `base.js` (global)
- Bootstrap JS bundle
- Ionicons ESM script
- Service Worker Finapp (PWA plugin Vite جایگزین است)

**گام بعدی پیشنهادی:** diff نسخه `style.css` آرشیو v2-2-2 با نسخه فعلی MyDapp1، سپس شروع port `app-settings.html` → `Settings.tsx` طبق `Titan_UI_Migration_Plan.md`.

---

*این سند یک inventory objective است. هیچ کد React در آن تولید نشده.*
