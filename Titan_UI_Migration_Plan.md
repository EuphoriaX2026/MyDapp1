# گزارش معماری مهاجرت Titan UI از Finapp به React/Tailwind

نقش: Dr. Satoshi، معمار ارشد Web3 و Frontend  
هدف: بازطراحی تجربه کاربری Finapp، مخصوصا صفحه Settings، در معماری React + Vite + Tailwind فعلی بدون استفاده مستقیم از Bootstrap، jQuery، Ionicons یا فایل‌های Vanilla JS قالب.

> نکته اجرایی: فایل `app-settings.html` با همین نام در workspace فعلی پیدا نشد؛ این برنامه بر اساس ساختارهای Finapp موجود در فایل‌های نمونه `DAPP Demo`، الگوهای کلاس‌هایی مثل `appHeader`، `appCapsule`، `appBottomMenu`، `listview` و وضعیت فعلی `src/pages/Settings.tsx` تدوین شده است.

## 1. استراتژی Layout

Finapp یک Shell کلاسیک موبایلی دارد: هدر ثابت بالا، کپسول محتوای مرکزی، و منوی ثابت پایین. در React ما نباید این ساختار را با همان DOM و CSS قالب کپی کنیم؛ باید آن را به قرارداد `PageLayout` و کامپوننت‌های مشترک پروژه تبدیل کنیم.

### نگاشت ساختار Finapp به React

| Finapp | نقش در قالب | مقصد پیشنهادی در پروژه |
| --- | --- | --- |
| `.appHeader` | نوار بالایی صفحه با دکمه برگشت، عنوان و اکشن راست | `src/components/layout/PageLayout.tsx` با propهای توسعه‌یافته برای `title`، `showBackButton`، `rightAction` و حالت `sticky` |
| `#appCapsule` | محدوده اصلی محتوا با padding مخصوص هدر/فوتر | بدنه `children` داخل `PageLayout` با `min-h-[100dvh]`، `pt-[env(safe-area-inset-top)]` و `pb-[calc(88px+env(safe-area-inset-bottom))]` |
| `.appBottomMenu` | Bottom navigation ثابت با آیتم فعال | استفاده از `src/components/MobileBottomNav` یا استخراج نسخه Tailwind آن به عنوان منوی اصلی، نه قرار دادن دوباره در هر صفحه |
| `.section` / `.appSection` | بلاک‌های محتوایی صفحه | `GlassCard` یا `SettingsSection` در `src/components/ui/` |
| `.extraHeader` | تب یا کنترل ثانویه زیر هدر | کامپوننت جدا مثل `SegmentedTabs` یا `PageSubHeader` در صورت نیاز |

### پیشنهاد برای `PageLayout.tsx`

`PageLayout` اکنون نقش قاب صفحه را دارد، اما هنوز ترکیبی از استایل روشن، شیشه‌ای و بعضی رنگ‌های `gray-900` است. برای مهاجرت Titan UI، باید آن را به یک shell موبایل‌اول با تم تیره تبدیل کنیم:

- ریشه صفحه: `min-h-[100dvh] bg-[#02071A] text-[#EAE8F3] overflow-x-hidden`.
- لایه پس‌زمینه: radial glow بنفش با `#5B38DA`، star/noise subtle، و safe-area برای PWA.
- هدر: `sticky top-0 z-30` یا در صفحات خاص `relative`، با `backdrop-blur-xl` و border پایین `border-[#D7E8F7]/10`.
- محتوای مرکزی: `w-full max-w-md mx-auto px-4` برای mobile wallet feel، و در desktop محدود به `max-w-3xl` یا `max-w-4xl`.
- padding پایین: همیشه فضای `MobileBottomNav` را حساب کند تا آخرین لیست پشت فوتر نرود.
- Bottom menu: فقط در shell سراسری (`App.tsx` یا `MobileBottomNav`) مدیریت شود؛ صفحه Settings نباید منوی Finapp را خودش render کند.

### اصل معماری

در Finapp صفحه‌ها HTML مستقل هستند. در DApp ما صفحه‌ها باید فقط محتوای صفحه باشند و shell مشترک از مسیر، وضعیت کیف پول، safe-area، PWA و navigation مراقبت کند. بنابراین `Settings.tsx` باید شبیه این فکر شود:

```tsx
<PageLayout title="Settings" maxWidth="max-w-md">
  <SettingsProfileCard />
  <SettingsSection title="Appearance" items={...} />
  <SettingsSection title="Security" items={...} />
</PageLayout>
```

## 2. استخراج کامپوننت‌ها

صفحه Settings در Finapp احتمالا مجموعه‌ای از avatar، listview، switch، dialog/action sheet و لینک‌های تنظیمات است. این عناصر باید به کامپوننت‌های React کوچک، typed و قابل استفاده مجدد در `src/components/ui/` تبدیل شوند.

### کامپوننت‌های ضروری

| عنصر Finapp | کامپوننت React پیشنهادی | مسیر پیشنهادی | توضیح |
| --- | --- | --- | --- |
| `avatar-section` / profile box | `SettingsProfileCard` یا `AvatarProfileCard` | `src/components/ui/AvatarProfileCard.tsx` | نمایش آواتار، نام کاربر، آدرس کوتاه کیف پول و اکشن تغییر تصویر/نام |
| `.listview` | `ListView` | `src/components/ui/ListView.tsx` | wrapper برای گروه آیتم‌ها با variantهای `flush`، `inset`، `glass` |
| `.listview-title` | `SectionLabel` | `src/components/ui/SectionLabel.tsx` | عنوان کوچک uppercase یا فارسی راست‌چین برای بخش‌ها |
| `.item` داخل listview | `SettingsListItem` | `src/components/ui/SettingsListItem.tsx` | label، description، icon، trailing، badge، onClick و حالت disabled |
| `.simple-listview` | `KeyValueList` | `src/components/ui/KeyValueList.tsx` | برای ردیف‌های label/value مثل وضعیت، شبکه، آدرس، نسخه برنامه |
| `.image-listview` | `IconListItem` | `src/components/ui/IconListItem.tsx` | ردیف دارای آیکن/تصویر سمت چپ و محتوای متنی |
| `.form-check-switch` | `Switch` یا `CosmicSwitch` | `src/components/ui/CosmicSwitch.tsx` | checkbox کنترل‌شده با `checked`/`onCheckedChange`، مناسب LocalStorage و تنظیمات امنیتی |
| `.form-group.basic` | `FormField` | `src/components/ui/FormField.tsx` | label، hint، error، input slot برای فرم‌هایی مثل RPC |
| `.dialogbox` | `ConfirmDialog` | `src/components/ui/ConfirmDialog.tsx` یا استفاده از `Modal` موجود | جایگزین modalهای Bootstrap برای تایید logout/delete |
| `.action-sheet` | `BottomSheet` | `src/components/ui/BottomSheet.tsx` | sheet موبایلی برای network settings، انتخاب زبان، انتخاب currency |
| `.badge` | `StatusBadge` | `src/components/ui/StatusBadge.tsx` | نشان وضعیت مثل Custom/Default/Connected |
| `.iconbox` | `IconOrb` | `src/components/ui/IconOrb.tsx` | قاب آیکن نئومورفیک با glow |
| `.appBottomMenu .item` | `BottomNavItem` | `src/components/MobileBottomNav.tsx` یا `src/components/ui/BottomNavItem.tsx` | نگاشت route، active state و آیکن‌های React |

### کامپوننت‌های ویژه Settings

این‌ها بهتر است ابتدا داخل `Settings.tsx` به شکل محلی ساخته شوند و بعد از تثبیت API به `ui/` منتقل شوند:

- `SettingsSection`: کارت شیشه‌ای شامل title و children.
- `SettingsRow`: ردیف قابل کلیک با `label`, `description`, `icon`, `trailing`.
- `SettingsToggleRow`: ترکیب `SettingsRow` و `CosmicSwitch`.
- `WalletAddressSheet`: نمایش آدرس کامل، copy button و explorer link.
- `NetworkSettingsSheet`: مدیریت RPC سفارشی با input، validate ساده و reset.

## 3. هماهنگ‌سازی استایل با Cosmic Neumorphism

Finapp در نسخه اصلی طراحی flat/Bootstrap دارد: سفید، primary آبی، borderهای ساده و shadow کم. Titan UI باید همان UX سریع و قابل فهم را نگه دارد، اما ظاهر آن باید با زمینه کیهانی و نئومورفیسم تیره پروژه هماهنگ شود.

### پالت هدف

| نقش | رنگ |
| --- | --- |
| Background | `#02071A` |
| Primary Text / Ice | `#D7E8F7` |
| Accent / Cosmic Purple | `#5B38DA` |
| Text Main | `#EAE8F3` |
| Text Muted | `#BAB8C3` |
| Danger | `#EF4444` یا `red-500` با opacity کنترل‌شده |
| Success | `#22C55E` با glow کم |

### قواعد ترجمه استایل

- به جای `bg-white` و `bg-primary` از سطح‌های شیشه‌ای استفاده شود: `bg-[#D7E8F7]/[0.06]`, `border-[#D7E8F7]/10`, `backdrop-blur-xl`.
- به جای کارت flat، از نئومورفیسم تیره استفاده شود:
  - outer shadow: `shadow-[0_18px_45px_rgba(0,0,0,0.45)]`
  - inner highlight: `inset_0_1px_0_rgba(215,232,247,0.12)`
  - glow: `0_0_35px_rgba(91,56,218,0.18)`
- `#5B38DA` فقط برای اکشن‌های فعال، switch روشن، badge فعال، focus ring و navigation active استفاده شود.
- `#D7E8F7` برای تیترها، آیکن‌های مهم، border highlight و knob روشن switch استفاده شود.
- listviewهای Finapp باید به کارت‌های rounded تبدیل شوند: `rounded-[1.5rem]` یا `rounded-3xl`، نه borderهای خطی Bootstrap.
- spacing فین‌اپ حفظ شود: ردیف‌ها compact و touch-friendly باشند، حداقل height حدود `52px`.
- از Ionicons مستقیم استفاده نشود؛ آیکن‌ها باید از `lucide-react` یا سیستم آیکن موجود پروژه بیایند.
- کلاس‌های Bootstrap مثل `row`, `col-6`, `btn`, `modal`, `form-control`, `nav-tabs` نباید وارد JSX شوند مگر به صورت موقت برای حذف تدریجی.

### نگاشت نمونه کلاس‌ها

| Finapp | Tailwind پیشنهادی |
| --- | --- |
| `appHeader` | `sticky top-0 z-30 flex h-14 items-center justify-between px-4 pt-[env(safe-area-inset-top)] bg-[#02071A]/80 backdrop-blur-xl border-b border-[#D7E8F7]/10` |
| `headerButton` | `grid h-10 w-10 place-items-center rounded-full border border-[#D7E8F7]/10 bg-[#D7E8F7]/5 text-[#D7E8F7] shadow-[inset_0_1px_0_rgba(215,232,247,0.10)] active:scale-95` |
| `pageTitle` | `text-base font-black tracking-tight text-[#D7E8F7]` |
| `section mt-2 mb-2` | `space-y-4 px-4 py-3` |
| `listview flush transparent` | `overflow-hidden rounded-[1.5rem] border border-[#D7E8F7]/10 bg-[#D7E8F7]/[0.06] backdrop-blur-xl` |
| `listview-title` | `px-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#BAB8C3]` |
| `form-check-switch` | `peer h-6 w-11 rounded-full bg-[#D7E8F7]/10 peer-checked:bg-[#5B38DA]` |
| `badge-primary` | `rounded-full bg-[#5B38DA]/20 px-2 py-0.5 text-xs font-bold text-[#D7E8F7] ring-1 ring-[#5B38DA]/40` |

## 4. برنامه عملیاتی تبدیل `app-settings.html` به `src/pages/Settings.tsx`

### فاز 1: تحلیل و مدل داده

- HTML صفحه Settings را به بخش‌های معنایی تقسیم کنیم: profile، appearance، profile settings، notifications، security، wallet/network.
- هر `listview` را به آرایه data-driven تبدیل کنیم تا JSX تکراری نشود.
- همه `href="#"`، `data-bs-toggle` و `data-bs-target` حذف و به state/event handlerهای React تبدیل شوند.
- همه `input type="checkbox"`های Finapp به state کنترل‌شده React وصل شوند.

### فاز 2: آماده‌سازی Layout

- `PageLayout` را برای تم تیره Titan آماده کنیم یا variant جدید مثل `theme="cosmic"` اضافه کنیم.
- padding پایین را با `MobileBottomNav` هماهنگ کنیم.
- هدر Settings باید از `PageLayout` بیاید، نه از markup مستقل Finapp.
- اگر صفحه نیاز به اکشن سمت راست دارد، prop مشخص مثل `rightAction` اضافه شود.

### فاز 3: ساخت UI primitives

- `CosmicSwitch` برای جایگزینی `form-check-switch`.
- `SettingsSection` برای جایگزینی `section + listview-title + listview`.
- `SettingsListItem` برای ردیف‌های قابل کلیک، دارای trailing text/badge/switch.
- `AvatarProfileCard` برای جایگزینی `avatar-section`.
- `BottomSheet` یا reuse از `Modal` موجود برای network/wallet dialogs.

### فاز 4: بازنویسی `Settings.tsx`

- کد فعلی `Settings.tsx` را حفظ رفتاری کنیم: username، avatar، wallet address، dark mode، notification، private profile، two-step، custom RPC و background upload.
- استایل‌های روشن مثل `text-gray-900`, `bg-white/10`, `bg-black/80` را با پالت Titan جایگزین کنیم.
- `Toggle` و `RowButton` محلی را با کامپوننت‌های جدید یا حداقل API نهایی‌شده بازنویسی کنیم.
- modalهای فعلی را از نظر ظاهر به BottomSheet/Glass modal تیره نزدیک کنیم.
- همه ردیف‌ها حداقل touch target مناسب داشته باشند: `min-h-[52px]`.

### فاز 5: حذف وابستگی‌های Finapp/Bootstrap

- هیچ `className` مبتنی بر Bootstrap مثل `btn`, `modal`, `form-control`, `row`, `col-*` وارد JSX جدید نشود.
- هیچ `data-bs-*`، Vanilla JS، یا dependency رفتاری قالب استفاده نشود.
- loader، dark-mode script و animationهای Finapp وارد React نشوند؛ رفتارها با hook/state مدیریت شوند.
- اگر CSS قدیمی Finapp هنوز در پروژه وجود دارد، صفحه جدید نباید به آن وابسته باشد.

### فاز 6: QA و معیار پذیرش

- صفحه در عرض‌های 360px، 390px، 430px و desktop بررسی شود.
- آخرین ردیف Settings پشت bottom nav پنهان نشود.
- contrast متن با زمینه `#02071A` قابل خواندن باشد.
- stateهای localStorage فعلی مهاجرت کنند و از بین نروند.
- keyboard focus برای switch، input و button مشخص باشد.
- wallet disconnect، RPC save/reset و background upload بدون خطای runtime کار کنند.

## چک‌لیست شروع اجرای تبدیل

- [ ] فایل واقعی `app-settings.html` را در پروژه قرار دهیم یا مسیر دقیق آن را مشخص کنیم.
- [ ] بخش‌های HTML را به mapping table نهایی تبدیل کنیم.
- [ ] `PageLayout` را با variant کیهانی یا کلاس‌های تم تیره سازگار کنیم.
- [ ] `CosmicSwitch`، `SettingsSection` و `SettingsListItem` را بسازیم.
- [ ] `AvatarProfileCard` را از profile block استخراج کنیم.
- [ ] `Settings.tsx` را data-driven کنیم و JSX تکراری را کاهش دهیم.
- [ ] Modalهای Bootstrap ذهنی را به `Modal` موجود یا `BottomSheet` React تبدیل کنیم.
- [ ] پالت `#02071A`, `#D7E8F7`, `#5B38DA` را در کلاس‌ها یا theme tokens یکپارچه کنیم.
- [ ] صفحه را با `npm run build` و تست دستی موبایل بررسی کنیم.

## جمع‌بندی معماری

مهاجرت موفق یعنی UX آشنای Finapp را نگه داریم، اما implementation و هویت بصری را کاملا React-native و Tailwind-native کنیم. `PageLayout` باید نقش shell را بگیرد، `Settings.tsx` فقط composition باشد، و اجزای تکرارشونده مثل list item، switch، avatar card و sheet به `src/components/ui/` منتقل شوند. نتیجه نهایی باید حس یک PWA Web3 تاریک، عمیق و نئومورفیک داشته باشد، نه یک قالب Bootstrap که صرفا رنگ آن تغییر کرده است.
