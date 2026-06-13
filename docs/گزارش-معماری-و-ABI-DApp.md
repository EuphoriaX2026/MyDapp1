# گزارش جامع معماری و پوشش قراردادهای هوشمند — E.ONE DApp

**تهیه‌کننده:** Dr. Satoshi (Lead Web3 Architect)  
**تاریخ:** ۲۸ مه ۲۰۲۶  
**دامنه:** بازطراحی Glassmorphism، Layout یکپارچه، و ممیزی ABI در برابر UI  
**شبکه:** Polygon Amoy  
**وضعیت Build:** موفق ✓

---

## فهرست مطالب

1. [خلاصه اجرایی](#۱-خلاصه-اجرایی)
2. [Task 1 — Layout یکپارچه دسکتاپ/موبایل](#۲-task-1--layout-یکپارچه-دeskتاپموبایل)
3. [Task 2 — تزریق Glassmorphism سراسری](#۳-task-2--تزریق-glassmorphism-سراسری)
4. [Task 3 — بازگردانی Login.tsx](#۴-task-3--بازگردانی-logintsx)
5. [Task 4 — چک‌لیست ABI و UI](#۵-task-4--چک‌لیست-abi-و-ui)
6. [نقشه قراردادها و لایه‌های سیستم](#۶-نقشه-قراردادها-و-لایه‌های-سیستم)
7. [پوشش فعلی UI (آنچه پیاده شده)](#۷-پوشش-فعلی-ui-آنچه-پیاده-شده)
8. [UIهای مفقود — اولویت‌بندی شده](#۸-uiهای-مفقود--اولویت‌بندی-شده)
9. [ناهماهنگی‌ها و بدهی فنی](#۹-ناهماهنگی‌ها-و-بدهی-فنی)
10. [پیشنهاد Sprint بعدی](#۱۰-پیشنهاد-sprint-بعدی)
11. [فهرست فایل‌های تغییر یافته](#۱۱-فهرست-فایل‌های-تغییر-یافته)

---

## ۱. خلاصه اجرایی

این گزارش نتیجه یک **بازطراحی معماری سراسری** در DApp پروژه E.ONE است. اهداف اصلی:

| هدف | وضعیت |
|-----|--------|
| پس‌زمینه یکپارچه بدون خط/مرز بین محتوا و لبه مانیتور | ✅ انجام شد |
| عرض محتوای متعادل دسکتاپ (`max-w-4xl` / `lg:max-w-5xl`) | ✅ انجام شد |
| Glassmorphism روی صفحات اصلی (به‌جز Login و هدر Dashboard) | ✅ انجام شد |
| بازگردانی Login به استایل Landing/Finapp | ✅ انجام شد |
| ممیزی کامل ABI در برابر UI | ✅ این سند |

**نتیجه کلیدی:** موتور ورود/ثبت‌نام (Login + Register wizard) تقریباً کامل است؛ اما **بیش از ۷۰٪ توابع write** قراردادهای Titan (Panel، Engine، Bank، Activator، Ledger) هنوز UI ندارند.

---

## ۲. Task 1 — Layout یکپارچه دسکتاپ/موبایل

### ۲.۱ مشکل قبلی

- `body` و `#root` پس‌زمینه `#F8F9FE` ساده داشتند در حالی که صفحات داخلی mesh/gradiant جداگانه داشتند.
- `.dapp-container` عرض تا `lg:max-w-7xl` داشت — در دسکتاپ خیلی پهن یا با پس‌زمینه جدا دیده می‌شد.
- برخی صفحات mesh ثابت (`fixed`) خودشان داشتند → خط/لبه بصری بین container و پس‌زمینه مانیتور.

### ۲.۲ تغییرات اعمال‌شده

#### `src/index.css`

- پس‌زمینه `body` با **همان frosted-mesh** که در `Register.tsx` استفاده می‌شود:
  - رنگ پایه: `#F8F9FE` (brand-surface)
  - سه radial-gradient (آبی، صورتی، indigo)
  - لایه `body::before` با گرادیان brand (`glass-gradient-brand`) و opacity 0.6
  - `background-attachment: fixed` برای canvas پیوسته هنگام scroll

#### `src/styles/tailwind.css`

کلاس `.dapp-container` به‌روزرسانی شد:

```css
.dapp-container {
  @apply relative mx-auto min-h-[100dvh] w-full px-4 py-6 md:px-6;
  @apply max-w-4xl lg:max-w-5xl;
}
```

**اصول طراحی:**
- بدون `border-x`، بدون `box-shadow` روی container
- بدون `bg-brand-surface` روی container — شفاف و ساختاری
- عمق بصری فقط از `GlassCard` / `.glass-panel` داخل صفحه

### ۲.۳ نتیجه بصری مورد انتظار

محتوا روی یک **بوم پیوسته** شناور است؛ نه جعبه جدا با رنگ متفاوت از حاشیه مانیتور.

---

## ۳. Task 2 — تزریق Glassmorphism سراسری

### ۳.۱ استثناهای الزامی (رعایت شد)

| استثنا | دلیل |
|--------|------|
| **Login.tsx** | Landing عمومی — بدون glass (Task 3) |
| **هدر + ProfileCard در Dashboard.tsx** | درخواست صریح کاربر — دست نخورده |

### ۳.۲ صفحات به‌روزرسانی‌شده

| صفحه | Wrapper | کامپوننت‌های Glass |
|------|---------|-------------------|
| `Dashboard.tsx` | `frosted-background` + `dapp-container` | — (ProfileCard legacy) |
| `MyWallet.tsx` | قبلاً glass داشت | `GlassCard`, `GlassButton` — mesh تکراری حذف شد |
| `Register.tsx` | `frosted-background` | `GlassCard`, `GlassButton`, `PremiumStepper` |
| `Store.tsx` | `frosted-background` | `GlassCard` (منوی موبایل) |
| `Checking.tsx` | `frosted-background` + `dapp-container` | `GlassCard`, `GlassButton` |
| `Exchange.tsx` | `frosted-background` + `dapp-container` | `GlassCard`, `GlassButton` |
| `Cart.tsx` | `frosted-background` + `dapp-container` | آماده برای Glass (wrapper) |
| `NFTDetails.tsx` | `frosted-background` + `dapp-container` | `GlassCard` (بخش قیمت) |

### ۳.۳ صفحات هنوز Bootstrap/Legacy (نیاز به فاز بعد)

- `Activate.tsx` — FinApp tabs، بدون glass
- `Settings.tsx` — `appHeader` + `#appCapsule`
- `CoinDetail.tsx` — `section` + `card`
- `TransactionDetail.tsx` — `bg-white` ساده
- `Cards.tsx` — `card-block` VIP
- `Ranks.tsx` — پس‌زمینه تیره جدا
- `Home2.tsx` — پروفایل inline (duplicate Dashboard)

---

## ۴. Task 3 — بازگردانی Login.tsx

### ۴.۱ تغییرات

| قبل (Glass) | بعد (Landing/Finapp) |
|-------------|---------------------|
| `frosted-background` | `bg-[#F8F9FE]` ساده |
| `glass-panel` navbar | navbar سفید solid با shadow ملایم |
| `GlassButton` Connect | دکمه آبی solid `#4E87FF` |
| `GlassCard` منوی موبایل | پنل سفید solid |
| `GlassButton` Learn more | دکمه سفید با border آبی |

### ۴.۲ منطق Web3 (بدون تغییر)

- `useReadContract` → `isUserAddressRegistered`
- redirect: ثبت‌شده → `/` | نشده → `/register`
- RainbowKit connect modal

---

## ۵. Task 4 — چک‌لیست ABI و UI

### ۵.۱ روش ممیزی

1. اسکن ۱۸ فایل JSON در `src/abis/`
2. استخراج توابع `view/pure` (read) و `nonpayable/payable` (write)
3. cross-reference با `src/pages/`، `src/components/`، `src/hooks/`
4. طبقه‌بندی: ✅ پوشش کامل | ⚠️ جزئی | ❌ مفقود

---

## ۶. نقشه قراردادها و لایه‌های سیستم

```
                    ┌─────────────┐
                    │   Router    │  ← رجیستری آدرس + upgrade
                    └──────┬──────┘
                           │
     ┌─────────────────────┼─────────────────────┐
     │                     │                     │
┌────▼────┐          ┌─────▼─────┐         ┌────▼────┐
│ Configs │          │   Panel   │◄────────│  Lens   │
│ (params)│          │ (facade)  │  read   │ (reads) │
└─────────┘          └─────┬─────┘         └─────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌──────▼──────┐    ┌─────▼─────┐
   │Register │      │  Activator  │    │   Store   │
   │ (tree)  │      │ (packages)  │    │ (products)│
   └────┬────┘      └──────┬──────┘    └─────┬─────┘
        │                  │                  │
        └──────────┬───────┴────────┬─────────┘
                   │                │
              ┌────▼────┐     ┌─────▼─────┐
              │ Engine  │     │   Bank    │
              │ (relay) │     │ (treasury)│
              └────┬────┘     └───────────┘
                   │
              ┌────▼────┐
              │ Ledger  │  ← state canonical
              └─────────┘

  ERX Layer: EDex ← ERouter ← EConfigs / EGuard / UpdateFund
  Tokens: ERX-token, E1-titan, AssetMaker (NFT)
```

---

## ۷. پوشش فعلی UI (آنچه پیاده شده)

### ۷.۱ Register — `Register-titan.json` ✅ (~۲۵٪)

| تابع | UI | فایل |
|------|-----|------|
| `register` | ✅ Confirm Transaction | `Register.tsx` step 2 |
| `isUserAddressRegistered` | ✅ اعتبارسنجی اسپانسر | `Register.tsx`, `Login.tsx` |
| `getUserStatus` | ✅ وضعیت G1/Free/Active/... | `Register.tsx` step 2 |
| `getDirectChildren`, `getMyParent`, `getUserPath` | ❌ | — |
| `blockUserPermanently`, `cleanupBlockedUsersBatch` | ❌ | admin |

**جریان کار:** Connect Wallet → Sponsor → Review → Active (wizard یک‌صفحه‌ای SPA)

---

### ۷.۲ Panel — `Panel-titan.json` ⚠️ (~۲۰٪)

| تابع | UI | فایل |
|------|-----|------|
| `getUserBasicDetails` | ✅ | `Dashboard.tsx` / `ProfileCard` |
| `getUserStatus` | ✅ | `Dashboard.tsx` |
| `getUserIncomeCapInfo` | ✅ | `Dashboard.tsx` |
| `getUserGroupTimestamps` | ✅ | `Dashboard.tsx` |
| `buyProduct` | ✅ (مسیر E1) | `Checking.tsx` |
| `claimRFTs` | ✅ | `WithdrawModal.tsx` |
| `activatePackage` | ❌ | `Activate.tsx` mock |
| `claimWeeklySharePayout` | ❌ | — |
| `processMyPendingPoints` | ❌ | — |
| `redeemE1` | ❌ | — |
| `equipTurboItem` / `unequipTurboItem` | ❌ | — |
| `qualifyForMonsterAward` | ❌ | — |
| `cleanupBlockedUsersBatch` | ❌ | — |
| `finalizeAndPriceWeek` | ❌ | — |

---

### ۷.۳ Store — `Store-titan.json` ⚠️ (~۱۵٪)

| تابع | UI | فایل |
|------|-----|------|
| `buyProduct` | ✅ (مسیر ERX) | `Checking.tsx` |
| `catalog` | ✅ read | `NFTDetails.tsx` |
| `getProductCount`, `getProductIdsPaginated` | ❌ | Store hardcoded |
| `redeemE1` | ❌ | — |
| `confirmReceipt`, `raiseDispute`, `claimTimeout` | ❌ | escrow |
| `addProduct`, `setProductStatus` | ❌ | admin |

**نکته:** ۷ Realm در `Store.tsx` hardcoded است — با کاتالوگ on-chain sync نیست.

---

### ۷.۴ Bank — `Bank-titan.json` ⚠️ (~۵٪)

| تابع | UI | فایل |
|------|-----|------|
| `getErxPriceUsd` | ✅ | `Store.tsx`, `Cart.tsx` |
| `deposit`, `requestWithdraw`, `executeWithdraw` | ❌ | — |
| `payout` | ❌ | — |
| `proposeSmartBurn`, `executeSmartBurn`, `publicPulseUpdate` | ❌ | — |
| `getSupportTokenBalance` | ❌ | — |

---

### ۷.۵ Lens — `Lens-titan.json` ⚠️ (~۱۰٪)

| تابع | UI | فایل |
|------|-----|------|
| `getRftFloorPrice` | ✅ | `WithdrawModal.tsx` |
| `getUserTotalPendingPoints` | ✅ | `Home2.tsx`, hooks |
| `getPointLedger` | ✅ | `useTeamReport`, `usePointsMatrix` |
| `getUserTreeInfo`, `getDirectChildren`, `getSubtreeCounts` | ❌ | **Genealogy Tree** |
| `getDashboardFullStats`, `getFullUserStats` | ❌ | — |
| `getUserPackageOverview`, `getExpiringPackages` | ❌ | — |
| `getStoreProductsPaginated` | ❌ | — |

**نکته:** `LensABI` در `Dashboard.tsx` import شده ولی **استفاده نمی‌شود**.

---

### ۷.۶ Engine — `Engine-titan.json` ❌ (~۰٪)

| تابع | اهمیت | UI |
|------|--------|-----|
| `claimRFTs` | بالا | ❌ (Panel proxy در WithdrawModal) |
| `processPendingPoints` | بالا | ❌ |
| `processRelayQueuePublic` | متوسط | ❌ |
| `finalizeAndPriceWeek` | بالا | ❌ |
| `addRelayTask` | پایین | ❌ |

---

### ۷.۷ Activator — `Activator-titan.json` ❌ (~۰٪)

| تابع | UI |
|------|-----|
| `activatePackage` | ❌ — `Activate.tsx` فقط UI mock |

---

### ۷.۸ AssetMaker — `AssetMaker-titan.json` ❌ (~۰٪)

| تابع | UI |
|------|-----|
| `mintAsset`, `lockAsset`, `unlockAsset` | ❌ |
| `tokenURI`, `getAssetDetails` | ❌ |
| `burn`, `operatorBurn` | ❌ |

---

### ۷.۹ Ledger — `Ledger-titan.json` ❌ (~۰٪ مستقیم)

فقط از طریق Lens/Panel خوانده می‌شود. UI مستقیم برای:
- `getUserDebt`
- `userPackageGroupExpiry`
- `weeklyData`, `weeklyRevenueE1`
- `userPointLedgers`

---

### ۷.۱۰ ERX Ecosystem

| قرارداد | پوشش UI |
|---------|---------|
| **EDex** (`edex.json`) | ✅ `buy`/`sell`/`getCurrentPrice` در `Exchange.tsx` |
| **ERX Token** | ✅ balance, transfer, approve |
| **E1 Titan** | ✅ balance در `useAccountBalances` |
| **EGuard** | ❌ `isUserPenalized`, `checkTransaction` |
| **EConfigs** | ⚠️ `getFeeRates` فقط در `SendActionSheet` |
| **UpdateFund** | ❌ `claim`, `getClaimableAmount` |
| **ERouter** | ❌ admin only |

---

## ۸. UIهای مفقود — اولویت‌بندی شده

### 🔴 P0 — بحرانی (مسیر کاربر اصلی)

| # | UI مفقود | توابع ABI | صفحه پیشنهادی |
|---|----------|-----------|---------------|
| 1 | **فعال‌سازی پکیج (Activate)** | `Panel.activatePackage`, `Activator.activatePackage` | بازنویسی `Activate.tsx` |
| 2 | **درخت ژنولوژی MLM** | `Lens.getUserTreeInfo`, `getDirectChildren`, `getNodeInfo`, `getSubtreeCounts` | `Genealogy.tsx` جدید |
| 3 | **داشبورد آماری کامل** | `Lens.getDashboardFullStats`, `getFullUserStats`, `getUserPackageOverview` | زیر ProfileCard در Dashboard |
| 4 | **Store on-chain** | `Store.getProductIdsPaginated`, `Lens.getStoreProductsPaginated` | sync `Store.tsx` |

---

### 🟠 P1 — مهم (درآمد و پاداش)

| # | UI مفقود | توابع ABI |
|---|----------|-----------|
| 5 | **Claim هفتگی RFT** | `Panel.claimWeeklySharePayout`, `Engine.finalizeAndPriceWeek` |
| 6 | **پردازش Points معلق** | `Panel.processMyPendingPoints`, `Engine.processPendingPoints` |
| 7 | **Redeem E1** | `Store.redeemE1`, `Panel.redeemE1` |
| 8 | **پیگیری سفارش / Escrow** | `Store.confirmReceipt`, `raiseDispute`, `claimTimeout` |
| 9 | **نمایش بدهی کاربر** | `Ledger.getUserDebt` (via Lens) |

---

### 🟡 P2 — متوسط (Treasury & Gamification)

| # | UI مفقود | توابع ABI |
|---|----------|-----------|
| 10 | **واریز/برداشت Bank** | `Bank.deposit`, `requestWithdraw`, `executeWithdraw` |
| 11 | **Smart Burn شفافیت** | `Bank.publicPulseUpdate`, `proposeSmartBurn` |
| 12 | **Monster Award** | `Panel.qualifyForMonsterAward` |
| 13 | **Turbo Items** | `Panel.equipTurboItem`, `unequipTurboItem` |
| 14 | **پاکسازی Inactive** | `Panel.removeInactiveChild`, `Register.cleanupBlockedUsersBatch` |
| 15 | **Royal Management** | `Register.addRoyal`, `removeRoyal` |

---

### 🟢 P3 — Admin / DevOps

| # | UI مفقود | توابع ABI |
|---|----------|-----------|
| 16 | **AssetMaker NFT Admin** | `mintAsset`, `lockAsset`, `unlockAsset` |
| 17 | **Configs Admin** | ۳۰+ setter در `Configs-titan.json` |
| 18 | **Router Upgrade UI** | `Router.proposeRouterUpgrade`, `executeRouterUpgrade` |
| 19 | **EDex Migration Monitor** | `EDex.announceMigration`, `executeMigration` |
| 20 | **Update Fund Claim** | `update-fund.claim` |

---

## ۹. ناهماهنگی‌ها و بدهی فنی

### ۹.۱ Duplicate Pages

| صفحه | مشکل |
|------|------|
| `Dashboard.tsx` vs `Home2.tsx` | هر دو پروفایل MLM — یکی باید canonical شود |
| `Store.tsx` cart inline vs `Cart.tsx` | دو flow سبد خرید |

### ۹.۲ Hardcoded Data

| محل | مشکل |
|-----|------|
| `Store.tsx` | ۷ Realm با hash ثابت — نه از `Store.catalog` |
| `Activate.tsx` | package hashes mock — بدون tx |
| `NFTDetails.tsx` | `erxPriceUsd = 0.0111` ثابت — باید از Bank oracle |
| `Ranks.tsx` | بدون read contract |

### ۹.۳ Importهای بلااستفاده

- `LensABI` در `Dashboard.tsx` — import شده، استفاده نشده
- `E1TitanABI` در `Home2.tsx` — import شده، استفاده نشده
- `useWriteContract` در `Login.tsx` — قبلاً import بود (در revert حذف شد ✓)

### ۹.۴ Routing

| مسیر | وضعیت |
|------|--------|
| `/register-confirm` | redirect به `/register` ✓ |
| `/` | Dashboard (Project) |
| `/Dashboard` | MyWallet |

---

## ۱۰. پیشنهاد Sprint بعدی

### فاز A — تکمیل مسیر کاربر (۲ هفته)

1. **`Activate.tsx`** → wire `Panel.activatePackage` با gas estimate
2. **`Genealogy.tsx`** → `Lens.getUserTreeInfo` + visualization
3. **`Store.tsx`** → fetch products از `Lens.getStoreProductsPaginated`
4. **Dashboard stats panel** → `Lens.getDashboardFullStats` زیر ProfileCard

### فاز B — Rewards & Treasury (۲ هفته)

5. **`Rewards.tsx`** → weekly claim + pending points
6. **`Redeem.tsx`** → E1 redemption
7. **Bank deposit/withdraw UI**
8. **EGuard penalty warnings** در Send/Exchange

### فاز C — Admin & Polish (ongoing)

9. Admin panel برای Configs/Router
10. Glass migration برای Settings, Activate, CoinDetail
11. حذف `Home2.tsx` duplicate

---

## ۱۱. فهرست فایل‌های تغییر یافته

| فایل | نوع تغییر |
|------|-----------|
| `src/index.css` | پس‌زمینه global mesh |
| `src/styles/tailwind.css` | `.dapp-container` + neumorphic utilities |
| `src/pages/Login.tsx` | revert به Landing |
| `src/pages/Dashboard.tsx` | frosted shell (profile intact) |
| `src/pages/MyWallet.tsx` | حذف mesh تکراری |
| `src/pages/Store.tsx` | frosted + GlassCard |
| `src/pages/Checking.tsx` | glass wizard checkout |
| `src/pages/Exchange.tsx` | glass cards + button |
| `src/pages/Cart.tsx` | frosted wrapper |
| `src/pages/NFTDetails.tsx` | frosted + GlassCard |
| `src/pages/Register.tsx` | wizard SPA (merge RegisterConfirm) |
| `src/components/ui/glass/PremiumStepper.tsx` | stepper neumorphic |
| `src/pages/RegisterConfirm.tsx` | **حذف شد** |
| `src/App.tsx` | redirect `/register-confirm` |

---

## جدول خلاصه پوشش ABI

| قرارداد | تعداد توابع (تقریبی) | پوشش UI | درصد |
|---------|---------------------|---------|------|
| Register | 48 | registration + status | ~25% |
| Panel | 81 | reads + buy + claimRFTs | ~20% |
| Lens | 71 | floor price + hooks | ~10% |
| Store | 36 | buy + catalog read | ~15% |
| Bank | 47 | price oracle only | ~5% |
| Engine | 31 | — | ~0% |
| Activator | 18 | — | ~0% |
| AssetMaker | 24 | — | ~0% |
| Ledger | 55 | indirect reads | ~0% |
| Configs + Router | 120+ | — | admin only |
| EDex + EGuard + UpdateFund | 44 | exchange partial | ~30% |

---

## نتیجه‌گیری

DApp از نظر **ورود، ثبت‌نام، و checkout فروشگاه** در مسیر درستی است. Glassmorphism و layout یکپارچه پایه بصری مناسبی ایجاد کرده‌اند.

**گلوگاه اصلی:** هسته MLM (activate → points → weekly claim → genealogy) هنوز UI ندارد. بدون `Activate.tsx` واقعی و درخت ژنولوژی، کاربر پس از ثبت‌نام در dead-end بصری قرار می‌گیرد.

اولویت مطلق Sprint بعد: **Activate + Genealogy + Store on-chain sync**.

---

*پایان گزارش — E.ONE DApp Architecture Sweep*
