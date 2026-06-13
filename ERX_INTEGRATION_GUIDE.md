# 🚀 ERX Phase 2 Integration Guide

**پروژه:** EuphoriaX Frontend Integration  
**معماری:** 5 قرارداد تخصصی (Phase 2)  
**شبکه‌ها:** Polygon Amoy Testnet + Polygon Mainnet  
**تاریخ:** 2026-02-15

---

## 📋 معماری Phase 2

### تفاوت Phase 1 و Phase 2

| جنبه | Phase 1 | Phase 2 |
|------|---------|---------|
| **ساختار** | یک قرارداد بزرگ | 5 قرارداد تخصصی |
| **توکن** | EuphoriaX (All-in-one) | ERX.sol (مدولار) |
| **صرافی** | داخلی | EDex.sol (جداگانه) |
| **کارمزدها** | Hardcoded | EConfigs.sol (قابل تنظیم) |
| **امنیت** | داخلی | EGuard.sol (ماژول امنیتی) |

### 5 قرارداد Phase 2

1. **ERX.sol** - توکن اصلی
   - Mint (ایجاد توکن)
   - Burn (سوزاندن توکن)
   - Transfer (انتقال با کارمزد 7%)

2. **EDex.sol** - صرافی غیرمتمرکز
   - `buy()` - خرید ERX با استیبل‌کوین
   - `sell()` - فروش ERX به استیبل‌کوین
   - `getCurrentPrice()` - دریافت قیمت لحظه‌ای

3. **EConfigs.sol** - تنظیمات سیستم
   - کارمزد خرید: 5% (4% خزانه + 1% صندوق)
   - کارمزد فروش: 5%
   - کارمزد انتقال: 7%

4. **ERouter.sol** - روتر مرکزی
   - دفترچه آدرس قراردادها
   - مدیریت ارتباط بین قراردادها

5. **EGuard.sol** - محافظ امنیتی
   - قوانین بازی عادلانه
   - جلوگیری از تراکنش‌های مخرب

---

## 🌍 آدرس‌ها Contracts

### Polygon Amoy Testnet (80002)

| قرارداد | آدرس | Explorer |
|---------|------|----------|
| **ERouter** | `0x431F4137Ce7860d2fe2E4c1F225AF8c92c57a1aA` | [View](https://amoy.polygonscan.com/address/0x431F4137Ce7860d2fe2E4c1F225AF8c92c57a1aA) |
| **ERX Token** | `0x111D252EB63c68727d9f81563394C53C03177111` | [View](https://amoy.polygonscan.com/address/0x111D252EB63c68727d9f81563394C53C03177111) |
| **EDex** | `0xFBc7F803b1d01A9848eB8f6bd1D65BE79eade59c` | [View](https://amoy.polygonscan.com/address/0xFBc7F803b1d01A9848eB8f6bd1D65BE79eade59c) |
| **EConfigs** | `0xB9dCa224787B6d1960606D2CaB6e57AE9A0afB1B` | [View](https://amoy.polygonscan.com/address/0xB9dCa224787B6d1960606D2CaB6e57AE9A0afB1B) |
| **EGuard** | `0x3E4a29Aae1745b39357905fd8EE941805A711BBc` | [View](https://amoy.polygonscan.com/address/0x3E4a29Aae1745b39357905fd8EE941805A711BBc) |
| **UpdateFund** | `0x85f517B78Bf26485dfcD302868B84a0A029A8E43` | [View](https://amoy.polygonscan.com/address/0x85f517B78Bf26485dfcD302868B84a0A029A8E43) |
| **Mock USDT** | `0x9827f46a80b4f7a6F458b66DCaD42963Ad7B64D6` | [View](https://amoy.polygonscan.com/address/0x9827f46a80b4f7a6F458b66DCaD42963Ad7B64D6) |
| **Mock DAI** | `0xEF4205228471Ce53778Ee56dD90712D688ECab0a` | [View](https://amoy.polygonscan.com/address/0xEF4205228471Ce53778Ee56dD90712D688ECab0a) |

### Polygon Mainnet (137)

> **⚠️ هشدار:** قراردادها هنوز روی Mainnet deploy نشده‌اند.  
> بعد از deployment، آدرس‌ها در `src/config/erx-contracts.ts` آپدیت می‌شوند.

---

## 🔄 سوئیچ بین Testnet و Mainnet

### ساختار Environment

```plaintext
Development (npm run dev) → .env.development → Amoy Testnet
Production (npm run build) → .env.production → Polygon Mainnet
```

### استفاده از Hook سوئیچ شبکه

```typescript
import { useNetworkSwitch } from '@/hooks/useNetworkSwitch'

function MyComponent() {
  const {
    networkMode, // 'testnet' یا 'mainnet'
    isOnCurrentNetwork,
    switchToCurrentNetwork,
    getExplorerUrl,
  } = useNetworkSwitch()

  return (
    <div>
      <p>شبکه فعلی: {networkMode}</p>
      {!isOnCurrentNetwork && (
        <button onClick={switchToCurrentNetwork}>
          سوئیچ به {networkMode === 'testnet' ? 'Testnet' : 'Mainnet'}
        </button>
      )}
    </div>
  )
}
```

---

## 💰 توابع کلیدی EDex

### 1. دریافت قیمت لحظه‌ای

```typescript
import { useReadContract } from 'wagmi'
import { ERX_CONTRACTS } from '@/config/erx-contracts'
import EDexABI from '@/abis/edex.json'

function CurrentPrice() {
  const { data: price } = useReadContract({
    address: ERX_CONTRACTS.EDex as `0x${string}`,
    abi: EDexABI.abi || EDexABI,
    functionName: 'getCurrentPrice',
  })

  // قیمت 18 اعشار دارد - تقسیم بر 1e18
  const formattedPrice = price ? Number(price) / 1e18 : 0

  return <div>قیمت: ${formattedPrice.toFixed(4)}</div>
}
```

### 2. خرید ERX (Buy Flow)

```typescript
import { useWriteContract, useReadContract } from 'wagmi'
import { parseUnits } from 'viem'
import { ERX_CONTRACTS, TOKENS } from '@/config/erx-contracts'
import EDexABI from '@/abis/edex.json'
import MockUSDTABI from '@/abis/mock-usdt.json'

function BuyERX() {
  const { writeContract } = useWriteContract()

  // مرحله 1: Approve USDT به EDex
  const approveUSDT = async (amount: string) => {
    const amountWei = parseUnits(amount, 6) // USDT = 6 decimals

    await writeContract({
      address: TOKENS.USDT as `0x${string}`,
      abi: MockUSDTABI.abi || MockUSDTABI,
      functionName: 'approve',
      args: [ERX_CONTRACTS.EDex, amountWei],
    })
  }

  // مرحله 2: خرید ERX
  const buyERX = async (usdtAmount: string) => {
    const amountWei = parseUnits(usdtAmount, 6)

    await writeContract({
      address: ERX_CONTRACTS.EDex as `0x${string}`,
      abi: EDexABI.abi || EDexABI,
      functionName: 'buy',
      args: [amountWei, TOKENS.USDT],
    })
  }

  return (
    <button onClick={() => {
      approveUSDT('10') // 1. Approve 10 USDT
        .then(() => buyERX('10')) // 2. Buy با 10 USDT
    }}>
      خرید با 10 USDT
    </button>
  )
}
```

### 3. فروش ERX (Sell Flow)

```typescript
function SellERX() {
  const { writeContract } = useWriteContract()

  // فروش ERX (نیاز به Approve ندارد - مکانیزم Burn)
  const sellERX = async (erxAmount: string) => {
    const amountWei = parseUnits(erxAmount, 18) // ERX = 18 decimals

    await writeContract({
      address: ERX_CONTRACTS.EDex as `0x${string}`,
      abi: EDexABI.abi || EDexABI,
      functionName: 'sell',
      args: [amountWei, TOKENS.USDT],
    })
  }

  return (
    <button onClick={() => sellERX('100')}>
      فروش 100 ERX
    </button>
  )
}
```

---

## 🛡️ مدیریت آدرس‌های صفر (Zero Address Defense)

```typescript
import { isContractDeployed, areAllContractsDeployed } from '@/config/erx-contracts'
import { ERX_CONTRACTS } from '@/config/erx-contracts'

function ExchangeButtons() {
  const canTrade = areAllContractsDeployed()

  if (!canTrade) {
    return (
      <div className="alert">
        ⚠️ قراردادها هنوز روی شبکه فعلی deploy نشده‌اند.
      </div>
    )
  }

  return (
    <>
      <button>خرید ERX</button>
      <button>فروش ERX</button>
    </>
  )
}
```

---

## 📊 محاسبه کارمزدها

```typescript
import { 
  calculateAmountAfterBuyFee,
  calculateAmountAfterSellFee,
  BUY_FEE_PERCENT 
} from '@/config/constants'

function FeeCalculator({ amount }: { amount: number }) {
  const afterBuyFee = calculateAmountAfterBuyFee(amount)

  return (
    <div>
      <p>مبلغ ورودی: {amount} USDT</p>
      <p>کارمزد خرید: {BUY_FEE_PERCENT}%</p>
      <p>ERX دریافتی: ~{afterBuyFee.toFixed(2)} USDT ارزش</p>
    </div>
  )
}
```

---

## 🧪 تست روی Testnet

### دریافت توکن‌های تست

1. **POL (Gas Fee):**
   - [Polygon Faucet](https://faucet.polygon.technology/)
   - Chain: Polygon Amoy
   - آدرس wallet خود را وارد کنید

2. **Mock USDT/DAI:**
   ```solidity
   // Mint مستقیم از قرارداد Mock USDT
   contract.mint(yourAddress, parseUnits("1000", 6))
   ```

### سناریوی تست کامل

```typescript
// 1. چک کردن شبکه
const { isOnCurrentNetwork, switchToCurrentNetwork } = useNetworkSwitch()
if (!isOnCurrentNetwork) switchToCurrentNetwork()

// 2. دریافت موجودی ERX
const { data: erxBalance } = useBalance({
  address: userAddress,
  token: ERX_CONTRACTS.ERX as `0x${string}`,
})

// 3. دریافت قیمت
const { data: price } = useReadContract({
  address: ERX_CONTRACTS.EDex,
  abi: EDexABI,
  functionName: 'getCurrentPrice',
})

// 4. خرید تست (1 USDT)
await buyERX('1')

// 5. فروش تست (0.5 ERX)
await sellERX('0.5')
```

---

## 🔗 منابع مفید

- [Polygon Amoy Explorer](https://amoy.polygonscan.com/)
- [Polygon Mainnet Explorer](https://polygonscan.com/)
- [Polygon Faucet](https://faucet.polygon.technology/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)

---

## ⚠️ نکات مهم امنیتی

1. **هرگز Private Key در کد فرانت قرار ندهید**
2. **Environment variables را درست مدیریت کنید**
3. **قبل از تراکنش، allowance چک کنید**
4. **برای Mainnet، مبالغ کوچک تست کنید**
5. **کاربران را قبل از سوئیچ شبکه warn کنید**

---

**تاریخ آخرین به‌روزرسانی:** 2026-02-15  
**نسخه:** Phase 2.0  
**وضعیت:** ✅ Testnet Ready | ⏳ Mainnet Pending
