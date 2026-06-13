# گزارش وضعیت معماری Titan / E.ONE

**نقش:** ممیزی قرارداد هوشمند و معمار سیستم  
**تاریخ:** ۲ ژوئن ۲۰۲۶ (بازبینی سورس `D:\MyTitan\src`)  
**دامنه:** `D:\MyDapp1` (فرانت + ABI) | **سورس حقیقت:** `D:\MyTitan\src\` (۴۰ فایل `.sol`)  
**شبکه DApp:** Polygon Amoy | **کامپایلر:** Solidity `0.8.28` | EVM `cancun` | `via_ir: true`

---

## خلاصه اجرایی

| لایه | وضعیت |
|------|--------|
| **فایل‌های `src`** | ۱۵ قرارداد + ۱۹ اینترفیس/زیراینترفیس + ۷ کتابخانه = **۴۰ فایل** (~۸٬۹۰۰ خط سورس) |
| **MyDapp1** | بدون `.sol`؛ ۱۹ ABI در `src/abis/` |
| **کامپایل** | `forge build --skip "script/**"` → **موفق** |
| **کامپایل کامل** | **شکست** — `script/archive/TitanUnifiedDeploy.s.sol` → `MockERX.sol` موجود نیست |
| **`forge test`** | پوشه `test/` **خالی** |
| **ریسک فوری** | نبود تست؛ Configs تا `finalizeSetup` ناقص؛ UpdateFund صفر؛ `ArbitrageController` خارج گراف Router |

---

## ۱. ساختار کلی پروژه (Project Architecture)

### ۱.۱ تقسیم‌بندی دو مخزن

```
D:\MyTitan\src\*.sol
    → forge build → out/{Name}.sol/{Name}.json
         → clean-abis.cjs → D:\MyDapp1\src\abis\{Name}-titan.json
              → wagmi (Register, Panel, Bank, Store, …)
```

### ۱.۲ فهرست کامل فایل‌های `D:\MyTitan\src` (بر اساس بررسی مستقیم)

#### قراردادهای اصلی (۱۵ فایل)

| فایل | خطوط (~) | pragma | قرارداد / نوع |
|------|----------|--------|----------------|
| `Register.sol` | 1026 | ^0.8.28 | `Register` |
| `Panel.sol` | 818 | ^0.8.28 | `Panel` |
| `Router.sol` | 794 | ^0.8.28 | `Router` |
| `Lens.sol` | 777 | ^0.8.28 | `Lens` |
| `Configs.sol` | 747 | ^0.8.28 | `Configs` |
| `Store.sol` | 710 | ^0.8.28 | `Store` + `IProductHook`, `IExternalFactory` |
| `Ledger.sol` | 692 | ^0.8.28 | `Ledger` |
| `Manager.sol` | 623 | ^0.8.28 | `Manager` |
| `Bank.sol` | 567 | ^0.8.28 | `Bank` |
| `Engine.sol` | 517 | ^0.8.28 | `Engine` |
| `Turbo.sol` | 357 | ^0.8.28 | `Turbo` |
| `Activator.sol` | 313 | ^0.8.28 | `Activator` |
| `ArbitrageController.sol` | 164 | **^0.8.20** | `ArbitrageController` + IERC20/UniV2 محلی |
| `AssetMaker.sol` | 155 | ^0.8.28 | `AssetMaker` |
| `E1.sol` | 70 | ^0.8.28 | `E1` |

**قرارداد abstract:** هیچ‌کدام — همه `contract` concrete هستند.

#### اینترفیس‌ها (`interfaces/` — ۱۹ فایل)

| فایل | خطوط | یادداشت |
|------|------|---------|
| `IEvents.sol` | 358 | `IGlobalEvents`, `IAllEventsRegister`, `IAllEventsReward`, `IAllEventsSupport`, `IDebugEvents`, `IEvents` |
| `ILens.sol` | 204 | API تحلیلی |
| `ILedger.sol` | 197 | read/write کنترل‌شده توسط Engine/Manager/Activator/Bank |
| `IConfigs.sol` | 182 | پارامترهای سیستم |
| `IStore.sol` | 172 | `Product`, `EscrowRecord`, … |
| `IAssetMaker.sol` | 156 | `IAssetMakerStructs` + `IAssetMaker` extends ERC721 |
| `IBank.sol` | 114 | `IAllEventsSupport` |
| `IRegister.sol` | 85 | extends `IAllEventsRegister`, `IGlobalEvents` |
| `ITurboLogic.sol` | 50 | boost / VIP cap |
| `IE1.sol` | 50 | mint/burn |
| `IEngine.sol` | 49 | صف relay، RFT، هفته |
| `IManager.sol` | 41 | Monster Award، resignation، weekly claim |
| `IERX.sol` | 33 | ERC20 metadata |
| `ITurbo.sol` | 26 | NFT game items |
| `IActivator.sol` | 9 | `activatePackage` |
| `IEDex.sol` | 9 | قیمت/سواپ ERX |
| `IRouter.sol` | 15 | **فقط view** — getters آدرس |
| `IAddressUpdatable.sol` | 16 | `updateAddresses()` |
| `IUpdateFund.sol` | 5 | placeholder |

#### کتابخانه‌ها (`libraries/` — ۷ فایل)

| فایل | خطوط | نقش |
|------|------|-----|
| `Network.sol` | 634 | **هسته MLM:** upline points، pending، relay، RFT |
| `Types.sol` | 164 | struct/enum مشترک (User packed، PointLedger، WeeklyData، …) |
| `Awards.sol` | 169 | Monster Award qualify/claim |
| `Arith.sol` | 90 | ریاضی امن |
| `Constants.sol` | 66 | `bytes32` کلید Router + role hash |
| `TimeDate.sol` | 50 | هفته/روز |
| `BokkyPooBahsDateTimeLibrary.sol` | 46 | تاریخ (legacy) |

### ۱.۳ سلسله‌مراتب وراثت و پیاده‌سازی

```
OpenZeppelin
├── Ownable2Step ──────────────► Router
├── ReentrancyGuard ───────────► Router, Register, Engine, Bank, Store,
│                                Activator, Panel, Manager, Turbo
├── Pausable ──────────────────► Router, Register, Engine, Bank, Store,
│                                Activator, Manager
├── ERC20 / ERC20Burnable ─────► E1
├── ERC721 ────────────────────► AssetMaker, Turbo
└── SafeERC20 (using) ─────────► Router, Register, Bank, Store, Activator, Panel

Interfaces (implements)
├── IRegister + IAddressUpdatable ──► Register (+ ReentrancyGuard, Pausable)
├── IConfigs + IAddressUpdatable ───► Configs
├── ILedger + IAddressUpdatable ────► Ledger
├── IBank + IAddressUpdatable + IDebugEvents + IGlobalEvents ──► Bank
├── IStore + IAddressUpdatable ─────► Store
├── IEngine + IAddressUpdatable ────► Engine
├── IActivator + IAddressUpdatable + IEvents ──► Activator
├── IManager + IAddressUpdatable ───► Manager
├── ILens + IAddressUpdatable ──────► Lens
├── IAddressUpdatable only ─────────► Panel, E1
├── IAssetMaker (+ ERC721) ─────────► AssetMaker
└── ITurboLogic (+ ERC721) ─────────► Turbo

مستقل (بدون OZ، بدون Router push)
└── ArbitrageController(owner/keeper) — pragma 0.8.20
```

### ۱.۴ الگوی `IAddressUpdatable` (Push از Router)

قراردادهای همگام‌شونده با `Router.syncAll()` / `syncBatch()` / `syncContract()`:

`Configs`, `Ledger`, `Bank`, `Store`, `Register`, `Engine`, `Activator`, `Panel`, `Lens`, `Manager`, `E1`, `AssetMaker`, `Turbo` (از طریق `updateAddresses`).

**استثنا:** `ArbitrageController` — آدرس ثابت در constructor؛ در `Constants` / Router ثبت نشده.

### ۱.۵ نقشه وابستگی ماژولار (خلاصه)

```
Router (contractAddresses[bytes32] + trackedKeys[])
    │
    ├─► Configs ─── پارامتر (groupCount=7، fees، RFT floor/ceiling، …)
    ├─► Ledger ─── state canonical (فقط onlyController: Engine|Manager|Activator|Bank)
    ├─► Register ── درخت باینری + lifecycle
    ├─► Engine ─── Network.sol + صف PointRelayTask
    ├─► Activator ─ پرداخت E1 + burn + upline (Network)
    ├─► Manager ── weekly RFT claim، Monster Award، resignation
    ├─► Bank ───── ERX oracle، payout، smart burn، withdraw timelock
    ├─► Store ─── catalog، mint E1، escrow، redeem
    ├─► Panel ─── Facade کاربر (همه writeهای عمومی)
    ├─► Lens ─── read aggregator (همپوشانی getter با Panel)
    ├─► E1 / AssetMaker / Turbo
    └─► (خارجی) ERX / EDex via Constants.ERX_KEY / EDEX_KEY در Bank
```

### ۱.۶ `Panel.sol` — Facade کاربر (توابع write عمومی)

| بخش | تابع | هدف |
|-----|------|-----|
| Register | `register(referrer)` | `registerContract.register(msg.sender, referrer)` |
| Register | `removeInactiveChild` | حذف فرزند غیرفعال |
| Register | `cleanupBlockedUsersBatch` | keeper عمومی |
| Register | `processLifecycleUpdatesBatch` | keeper lifecycle |
| Activator | `activatePackage(groupIdx)` | فعال‌سازی Classic |
| Manager | `claimWeeklySharePayout(weekId)` | سهم هفتگی RFT |
| Manager | `qualifyForMonsterAward` | Monster Award |
| Engine | `processMyPendingPoints` | تراز پوینت گروه |
| Engine | `claimRFTs` | claim همه گروه‌ها |
| Engine | `finalizeAndPriceWeek` | قیمت‌گذاری هفته |
| Engine | `processRelayQueuePublic` | پردازش صف relay |
| Store | `buyProduct` / `redeemE1` | فروشگاه |
| Turbo | `equipTurboItem` / `unequipTurboItem` | آیتم بازی |

**خواندن:** Panel ده‌ها getter دارد که عمدتاً به `Lens`، `Register`، `IConfigs` (از طریق Lens) و `Bank.getErxPriceUsd` delegate می‌کند — **تکرار API با Lens** (هزینه نگهداری ABI).

### ۱.۷ `Register.sol` — کنترل دسترسی (دقیق از سورس)

| Modifier | مجاز |
|----------|------|
| `onlyDAO` | `router.getDao()` — pause، router upgrade، … |
| `onlyDaoAndRouter` | DAO یا Router — `updateAddresses` |
| `onlyPanel` (private `_checkOnlyPanel`) | عملیات مخصوص Panel |
| `onlyEngineOrActivator` | Engine یا Activator |
| `onlySystem` | **Engine یا Manager** — مثلاً `blockUserPermanently` |
| `register` | `msg.sender == panel \|\| msg.sender == user` |

**نکته:** `import AccessControl` وجود دارد ولی **وراثت AccessControl ندارد** — بقایای refactor.

**ثابت‌ها:** `ROUTER_UPGRADE_TIMELOCK = 2 days`؛ `queenAddress` immutable در constructor.

### ۱.۸ `Ledger.sol` — کنترل state

- **تنها** `Engine`, `Manager`, `Activator`, `Bank` (کش‌شده از Router) می‌توانند state را mutate کنند (`onlyController`).
- **DAO** برای `setRouterAddress` و تنظیمات حاکمیتی.
- مپینگ‌های اصلی: `userPointLedgers`, `userPendingPoints`, `weeklyData`, `weeklyRevenueE1`, `userPackageGroupExpiry`, `userTotalRftBaseShares`, `userDebtUSD`, Monster Award storage، …

### ۱.۹ `Configs.sol` — bootstrap

- Constructor: `groupCount = 7`, `piggybackCountLimit = 10` — **بقیه مقادیر در deploy script**.
- `finalizeSetup()` — `onlyDAO`، نیاز `rftCeilingPrice > 0` و `isInitialized`.
- Getterها `onlyInitialized` (fail-fast).
- `groupCount` فقط **افزایش** مجاز (`require(_count >= groupCount)`).

### ۱.۱۰ لایه ERX (خارج `MyTitan/src`)

در `D:\MyDapp1\src\config\erx-contracts.ts`: ERouter, ERX, EConfigs, EGuard, EDex, UpdateFund — **Bank** از `IERX` / `IEDex` برای قیمت و payout استفاده می‌کند.

### ۱.۱۱ استقرار Amoy (`my-titan-contracts.ts`)

| ماژول | آدرس |
|--------|------|
| Router | `0xb5fd9d359a133C56A2DA64FACab2895cB4667117` |
| Register | `0x91Fc32754aA4c37bAFEC3549eB5781142976a666` |
| Panel | `0xEe3E79BF496Cc79a857B1d34d352417e71D089eE` |
| Engine | `0x50655E1Df16436D981e80d1560DdD32093f2e250` |
| Bank | `0x6264012808423C7B95c6269834fC5EE6A82ccAaa` |
| Store | `0x83316c3a8d5a981246f9f54a368010dDa945E07d` |
| E1 | `0xe1c2FDF975532A25765cc26273A51E736789d1E1` |
| Manager | `0xa28BD7D5494c691FD2527a2CeF49E5FEA1F54CF8` |
| Turbo | `0x52AB6a74eB77F95aE5C6184E3833893B1C50b10f` |
| UpdateFund | `0x000…000` | **غیرفعال در فرانت** |

**Mainnet Titan:** همه `ZERO_ADDRESS`.

---

## ۲. وضعیت منطق توکنومیک و مالی (Economic Logic)

### ۲.۱ ثبت‌نام (`Register`)

- درخت **باینری**؛ حداکثر **۲** فرزند (`directChildrenCount < 2`).
- مسیر: `_userPaths[]` + `userByPathHash`.
- **بدون جریان مالی** در `register` — فقط توپولوژی + piggyback `_tryProcessQueue()` → Engine.
- Lifecycle: Free → Inactive → Blocked؛ Royal/Queen جدا (`addRoyal` / `removeRoyal` — DAO/System).

### ۲.۲ فعال‌سازی پکیج (`Activator._executeActivatePackage`)

**محدودیت نوع:** فقط `Types.PackageType.Classic` — خطا در غیر این صورت.

**پرداخت (واحد: E1 به‌عنوان ۱:۱ USD در `balanceOf`):**

```
priceUSD = finalPrice (با penalty تمدید)
feeE1    = priceUSD * 500 / 10000   // 5% ثابت در کد — نه از Configs
burnAmount = priceUSD - feeE1

اگر updateFundAddress != 0:
    transferFrom(user → updateFund, feeE1)
    burnFrom(user, burnAmount)
وگرنه:
    burnFrom(user, priceUSD)  // کل مبلغ سوزانده می‌شود
```

- `ledger.addWeeklyRevenueE1(currentWeek, priceUSD)` — درآمد هفته.
- اولین فعال‌سازی: `Network.processUplinePoints` → در صورت نیاز `engine.addRelayTask`.
- گروه ۱: `register.extendUserValidity`؛ گروه‌های بالاتر نیاز expiry گروه قبلی.
- **G1 grace:** پس از expiry، تمدید خارج از `renewalGracePeriod` → revert permanent block.

### ۲.۳ پوینت و RFT (`Network.sol` + `Engine`)

| تابع کتابخانه | نقش |
|---------------|-----|
| `processUplinePoints` | توزیع پوینت upline هنگام فعال‌سازی |
| `processPendingPoints` | تراز raw/paid، تولید RFT |
| `processRelayTask` | صف relay با `retryCount` |
| `calculateAndGenerateRFTs` | تولید سهام |
| `expireRawPoints` | انقضای raw |

**Engine:**

- `finalizeAndPriceWeek` — قیمت سهم از `weeklyRevenueE1 / totalShares` با **floor/ceiling** Configs؛ کسری از موجودی Bank (ERX→USD).
- `claimRFTs(user)` — کارمزد از `claimFeeBPS` / `lifeFeeBPS` Configs.
- **Turbo:** `getUserBoostMultiplier` — `try/catch`؛ پیش‌فرض `10000` BPS.

### ۲.۴ Manager — پاداش‌های موازی

- `claimWeeklySharePayout(user, weekId)` — سهم هفتگی (تعامل Ledger + Bank).
- `qualifyForMonsterAward` / `claimMonsterAwardInstallment` — از `Awards.sol`.
- `requestResignation` / `claimResignationInstallment` — بازپرداخت مرحله‌ای.
- `validateActivationPolicy` — قبل از فعال‌سازی در Activator.

### ۲.۵ Bank — خزانه

| مکانیزم | مقدار / رفتار |
|---------|----------------|
| `WITHDRAW_DELAY` | 48 ساعت |
| Smart Burn cooldown | 90 روز |
| Burn timelock | 3 روز |
| Burn execution window | 7 روز |
| `onlySpender` | Store, Engine |
| Oracle ERX | DEX + volatility / heartbeat |
| `payout` | تبدیل USD→ERX برای خروجی |

### ۲.۶ Store — محصول و E1

- **خرید:** `priceUSD` × `mintingRate` / 10000 → mint E1 به `creatorShareBPS`, `fundShareBPS`, cashback خریدار.
- **REDEEM_FEE_BPS** = 500 (5%) برای E1→ERX.
- **Escrow / dispute** — `EscrowRecord` در `IStore`؛ هوک `IProductHook`.
- **Turbo:** `IExternalFactory.mintFromStore`.
- `gasThreshold = 500000` — piggyback Engine پس از خرید (مشابه Activator).

### ۲.۷ E1

- `transferFeeBPS = 250` (2.5%)؛ سقف DAO 25%.
- Minter: Store, Manager, Engine, Bank | Burner: Store, Manager, Activator, Bank.

### ۲.۸ Configs — کارمزدهای قابل تنظیم (پس از initialize)

| پارامتر | سقف setter |
|---------|------------|
| `claimFeeBPS` | 5% |
| `lifeFeeBPS` | 20% |
| `burnRatioBPS` | 50% |

**تضاد با Activator:** fee فعال‌سازی **۵٪ hardcoded** است، نه `lifeFeeBPS`/`claimFeeBPS`.

### ۲.۹ `ArbitrageController` (خارج اکوسیستم Router)

- `targetPrice = 1e18` (۱ DAI per E1).
- `deviationBps = 200` (2%)؛ `rebalance()` فقط `keeper`.
- Swap روی Uniswap V2 — **بدون اتصال به Panel/Bank/Configs**.

### ۲.۱۰ شکاف‌های توکنومیک

1. **UpdateFund = 0** → 5% fee Activator و fundShare Store سوزانده/از دست می‌رود.
2. **Classic-only Activator** در حالی که Configs/VIP/Royal در Types وجود دارد.
3. **فرض 1 E1 = 1 USD** در `balanceOf` بدون decimal normalization در Activator.
4. **Panel/Lens/API duplicate** — ریسک ناسازگاری getter.
5. **UI << on-chain writes** (گزارش DApp).

---

## ۳. وضعیت فنی و خطاها (Technical State & Errors)

### ۳.۱ کامپایل Foundry (`D:\MyTitan\foundry.toml`)

| تنظیم | مقدار |
|--------|--------|
| `solc_version` | 0.8.28 |
| `optimizer_runs` | 200 |
| `via_ir` | true |
| `evm_version` | cancun |
| `bytecode_hash` | none |
| invariant | runs=50, depth=25 |

| دستور | نتیجه |
|--------|--------|
| `forge build` | **Fail** — `MockERX.sol` missing ← `script/archive/TitanUnifiedDeploy.s.sol` |
| `forge build --skip "script/**"` | **Success** — ۱۵ قرارداد `src/` |
| `forge test` | **Fail** — no tests + همان وابستگی script |

**Lint (موفق build):** `asm-keccak256` در `Bank.sol` (چند موضع)، `Network.sol:578`.

### ۳.۲ مشکلات ساختاری

| ID | شدت | جزئیات |
|----|------|--------|
| T-01 | بحرانی | `test/` خالی — invariant config بی‌استفاده |
| T-02 | بالا | Archive deploy شکسته (`MockERX`) |
| T-03 | بالا | `Configs` بدون `finalizeSetup` در deploy → revert همه getterهای `onlyInitialized` |
| T-04 | متوسط | `Register` import `AccessControl` بلااستفاده |
| T-05 | متوسط | `ArbitrageController` pragma 0.8.20 |
| T-06 | متوسط | `clean-abis.cjs` بدون Manager/Turbo |
| T-07 | پایین | `Store.sol` کامنت‌های debug طولانی (نگهداری) |

### ۳.۳ MyDapp1

- Build Vite: موفق.
- یکپارچه‌سازی: `Register.register`, `Panel`/`Lens` reads, `Bank.getErxPriceUsd`, `Store`/`EDex`.

### ۳.۴ تست یکپارچگی

`D:\MyTitan\script\test\` — Forge Script روی RPC Amoy (نه unit test).

---

## ۴. نقاط اتصال و وابستگی‌های خارجی

### ۴.۱ OpenZeppelin (`lib/openzeppelin-contracts`)

| ماژول OZ | استفاده |
|----------|---------|
| `Ownable2Step` | Router (owner = deployer/DAO path) |
| `ReentrancyGuard` | ۹ قرارداد |
| `Pausable` | ۶ قرارداد |
| `SafeERC20` | ۶ قرارداد |
| `ERC20` / `Burnable` | E1 |
| `ERC721` | AssetMaker, Turbo |
| `EnumerableSet` | Store |

### ۴.۲ فراخوانی cross-contract (خلاصه دقیق)

```
User → Panel.register → Register.register
User → Panel.activatePackage → Activator → E1.burn/transfer + Ledger + Network → Engine.addRelayTask
User → Panel.claimRFTs → Engine → Ledger + Bank
User → Panel.buyProduct → Store → E1.mint + AssetMaker + (optional) Turbo factory
Register._tryProcessQueue / Activator._tryProcessQueue / Store → try Engine.processRelayQueuePublic()
Router.setAddress → IAddressUpdatable.updateAddresses() [تمام ماژول‌ها]
Bank → IEDex / IERC20(ERX) [قیمت]
```

### ۴.۳ وابستگی off-chain

| منبع | مصرف |
|------|------|
| Polygon Amoy RPC | deploy/test scripts |
| wagmi/RainbowKit | MyDapp1 |
| `D:\MyERX` (جدا) | سورس ERX |

### ۴.۴ remappings

```
@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/
forge-std/=lib/forge-std/src/
@Libraries/=src/libraries/
@Interfaces/=src/interfaces/
```

---

## ۵. آسیب‌پذیری‌ها و ناکارآمدی گس (ممیزی اولیه)

> ممیزی رسمی نیست — بر اساس خوانش کامل `src/`.

### ۵.۱ Governance / مرکزیت

| موضوع | یافته |
|--------|--------|
| Router `onlyOwner` | pause، setAddress، sync، router upgrade |
| DAO در ماژول‌ها | fees، pause، smart burn |
| Panel به‌عنوان relayer | ثبت‌نام برای `msg.sender` — استاندارد UX اما Panel compromise = vector |
| `blockUserPermanently` | فقط Engine/Manager — نه کاربر |

### ۵.۲ منطقی / اقتصادی

| موضوع | یافته |
|--------|--------|
| Fee Activator 5% hardcoded | عدم همخوانی با Configs |
| E1 balance = USD amount | بدون `decimals()` — خطر اگر E1 دارای 18 decimal و قیمت غیر 1:1 باشد |
| `try/catch` خاموش Engine queue | ثبت‌نام/فعال‌سازی بدون revert اگر queue fail |
| RFT floor از Bank | اگر Bank خالی → قیمت نهایی زیر floor |
| ArbitrageController `onlyKeeper` | کلید keeper = owner در constructor |

### ۵.۳ گس

| محل | دلیل |
|-----|------|
| `Network.sol` (~634 خط) | حلقه upline، SSTORE زیاد، `keccak256(abi.encode(pathData))` |
| `Register` (~1026 خط) | lifecycle batch، path array |
| `Lens`/`Panel` | getterهای تکراری — هزینه off-chain RPC نه on-chain |
| `via_ir` | deploy سنگین؛ runtime بهتر |

### ۵.۴ اقدامات پیشنهادی (اولویت)

1. تست Foundry: `register` (2-leg)، `activatePackage` (fee split)، `finalizeAndPriceWeek`, Bank withdraw timelock.
2. حذف/بازسازی `MockERX` یا exclude دائمی `script/archive` در CI.
3. `finalizeSetup` را در چک‌لیست deploy اجباری کنید.
4. آدرس UpdateFund روی Amoy یا revert صریح در Activator/Store وقتی صفر است.
5. هماهنگ‌سازی fee Activator با Configs یا مستندسازی عمد hardcode.
6. حذف `import AccessControl` از Register.
7. تصمیم: ادغام یا حذف `ArbitrageController` از scope production.

---

## ۶. نتیجه‌گیری

پس از بررسی خط‌به‌خط **۴۰ فایل** در `D:\MyTitan\src`:

- معماری **Facade (Panel) + State (Ledger) + Logic (Engine/Network) + Treasury (Bank)** مشخص و ماژولار است.
- **۷ گروه** پکیج، **درخت باینری**، **RFT هفتگی** و **Monster Award** به‌صورت on-chain پیاده شده‌اند.
- محیط Foundry برای **`src/` سالم** است؛ pipeline deploy/تست و **bootstrap Configs** نقطه ضعف عملیاتی‌اند.
- **MyDapp1** مصرف‌کننده است؛ هر تغییر قرارداد → `forge build --skip "script/**"` + `node clean-abis.cjs`.

**آمادگی production:** تست‌نت/توسعه — بله با محدودیت UpdateFund؛ **mainnet** — خیر تا تکمیل deploy، تست، و audit.

---

*منبع: بررسی مستقیم `D:\MyTitan\src` در تاریخ گزارش. برای همگام‌سازی ABI: `node clean-abis.cjs` از ریشه `D:\MyDapp1`.*
