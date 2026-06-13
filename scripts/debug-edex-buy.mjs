import { createPublicClient, http, formatUnits, parseUnits } from 'viem';
import { polygonAmoy } from 'viem/chains';

const EDex = '0xFBc7F803b1d01A9848eB8f6bd1D65BE79eade59c';
const EConfigs = '0xB9dCa224787B6d1960606D2CaB6e57AE9A0afB1B';
const DAI = '0xEF4205228471Ce53778Ee56dD90712D688ECab0a';
const USER = '0xB0B909C9e3cdc8E2Cc221E3a38c6c61889a94b14';
const EGuard = '0x3E4a29Aae1745b39357905fd8EE941805A711BBc';
const ERX = '0x111D252EB63c68727d9f81563394C53C03177111';
const USDT = '0x9827f46a80b4f7a6F458b66DCaD42963Ad7B64D6';

const client = createPublicClient({
  chain: polygonAmoy,
  transport: http('https://rpc-amoy.polygon.technology'),
});

const erc20 = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'allowance', type: 'function', stateMutability: 'view', inputs: [{ type: 'address' }, { type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
];

const edexAbi = [
  { name: 'getCurrentPrice', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'cachedTotalLiquidity', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'getTotalLockedValue', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'paused', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool' }] },
  { name: 'initialized', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool' }] },
  { name: 'configs', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { name: 'stablecoins', type: 'function', stateMutability: 'view', inputs: [{ type: 'uint256' }], outputs: [{ type: 'address' }] },
  { name: 'buy', type: 'function', stateMutability: 'nonpayable', inputs: [{ type: 'uint256' }, { type: 'address' }, { type: 'uint256' }], outputs: [{ type: 'uint256' }] },
];

const econfigsAbi = [
  { name: 'isSupportedStablecoin', type: 'function', stateMutability: 'view', inputs: [{ type: 'address' }], outputs: [{ type: 'bool' }] },
  { name: 'getFeeRates', type: 'function', stateMutability: 'view', inputs: [{ type: 'uint256' }, { type: 'uint8' }], outputs: [{ type: 'uint256' }, { type: 'uint256' }] },
  { name: 'minAmount', type: 'function', stateMutability: 'view', inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'tokenDecimals', type: 'function', stateMutability: 'view', inputs: [{ type: 'address' }], outputs: [{ type: 'uint8' }] },
];

const eguardAbi = [
  { name: 'isUserPenalized', type: 'function', stateMutability: 'view', inputs: [{ type: 'address' }], outputs: [{ type: 'bool' }] },
  { name: 'whitelisted', type: 'function', stateMutability: 'view', inputs: [{ type: 'address' }], outputs: [{ type: 'bool' }] },
  { name: 'activePenalty', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool' }] },
];

const usdAmount = parseUnits('1', 18);
const minOut = 84019944427036624077n;

const [bal, allow, dec, price, liq, tvl, paused, init, configsAddr, supported, minAmt, tokenDec, fees, penalized] =
  await Promise.all([
    client.readContract({ address: DAI, abi: erc20, functionName: 'balanceOf', args: [USER] }),
    client.readContract({ address: DAI, abi: erc20, functionName: 'allowance', args: [USER, EDex] }),
    client.readContract({ address: DAI, abi: erc20, functionName: 'decimals' }),
    client.readContract({ address: EDex, abi: edexAbi, functionName: 'getCurrentPrice' }),
    client.readContract({ address: EDex, abi: edexAbi, functionName: 'cachedTotalLiquidity' }),
    client.readContract({ address: EDex, abi: edexAbi, functionName: 'getTotalLockedValue' }),
    client.readContract({ address: EDex, abi: edexAbi, functionName: 'paused' }),
    client.readContract({ address: EDex, abi: edexAbi, functionName: 'initialized' }),
    client.readContract({ address: EDex, abi: edexAbi, functionName: 'configs' }),
    client.readContract({ address: EConfigs, abi: econfigsAbi, functionName: 'isSupportedStablecoin', args: [DAI] }),
    client.readContract({ address: EConfigs, abi: econfigsAbi, functionName: 'minAmount', args: [DAI] }),
    client.readContract({ address: EConfigs, abi: econfigsAbi, functionName: 'tokenDecimals', args: [DAI] }),
    client.readContract({ address: EConfigs, abi: econfigsAbi, functionName: 'getFeeRates', args: [0n, 0] }),
    client.readContract({ address: EGuard, abi: eguardAbi, functionName: 'isUserPenalized', args: [USER] }),
  ]);

console.log('=== State ===');
console.log('DAI balance:', formatUnits(bal, dec));
console.log('DAI allowance to EDex:', formatUnits(allow, dec));
console.log('ERX price USD:', formatUnits(price, 18));
console.log('cachedTotalLiquidity:', liq.toString());
console.log('getTotalLockedValue:', tvl.toString());
console.log('paused:', paused, 'initialized:', init);
console.log('configs addr:', configsAddr);
console.log('DAI supported:', supported);
console.log('DAI minAmount:', minAmt.toString(), 'tokenDecimals:', tokenDec);
console.log('feeRates cat0 buy:', fees.map((x) => x.toString()));
console.log('user penalized:', penalized);

for (let i = 0; i < 5; i++) {
  try {
    const sc = await client.readContract({ address: EDex, abi: edexAbi, functionName: 'stablecoins', args: [BigInt(i)] });
    if (sc === '0x0000000000000000000000000000000000000000') break;
    console.log('stablecoin', i, sc);
  } catch {
    break;
  }
}

const totalFee = fees[0] + fees[1];
const feeWei = (usdAmount * totalFee) / 10n ** 18n;
const usdNet = usdAmount - feeWei;
const expectedOut = (usdNet * 10n ** 18n) / price;
console.log('=== Quote ===');
console.log('usdAmount:', usdAmount.toString());
console.log('totalFeeRate:', totalFee.toString());
console.log('expectedOut:', expectedOut.toString(), formatUnits(expectedOut, 18));
console.log('minOut from console:', minOut.toString());
console.log('minOut > expectedOut?', minOut > expectedOut);

const extraEdex = [
  { name: 'migrationAnnounced', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool' }] },
  { name: 'router', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { name: 'swapRouter', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { name: 'lastPrice', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'lastPriceUpdateTime', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
];

const [migration, router, swapRouter, lastPrice, lastPriceUpdate, erxBalDex, erxBalUser, whitelisted, activePenalty] =
  await Promise.all([
    client.readContract({ address: EDex, abi: extraEdex, functionName: 'migrationAnnounced' }),
    client.readContract({ address: EDex, abi: extraEdex, functionName: 'router' }),
    client.readContract({ address: EDex, abi: extraEdex, functionName: 'swapRouter' }),
    client.readContract({ address: EDex, abi: extraEdex, functionName: 'lastPrice' }),
    client.readContract({ address: EDex, abi: extraEdex, functionName: 'lastPriceUpdateTime' }),
    client.readContract({ address: ERX, abi: erc20, functionName: 'balanceOf', args: [EDex] }),
    client.readContract({ address: ERX, abi: erc20, functionName: 'balanceOf', args: [USER] }),
    client.readContract({ address: EGuard, abi: eguardAbi, functionName: 'whitelisted', args: [USER] }),
    client.readContract({ address: EGuard, abi: eguardAbi, functionName: 'activePenalty' }),
  ]);

console.log('migrationAnnounced:', migration);
console.log('router:', router, 'swapRouter:', swapRouter);
console.log('lastPrice:', formatUnits(lastPrice, 18), 'updated:', lastPriceUpdate.toString());
console.log('ERX balance EDex:', formatUnits(erxBalDex, 18), 'user:', formatUnits(erxBalUser, 18));
console.log('EGuard whitelisted:', whitelisted, 'activePenalty:', activePenalty);

// skip full history logs on Amoy RPC limits
console.log('Historical Buy events: skipped (RPC block range limit)');

for (const [label, mo] of [
  ['frontend minOut', minOut],
  ['expectedOut', expectedOut],
  ['0', 0n],
]) {
  try {
    await client.simulateContract({
      address: EDex,
      abi: edexAbi,
      functionName: 'buy',
      args: [usdAmount, DAI, mo],
      account: USER,
    });
    console.log(`simulate OK [${label}]:`, mo.toString());
  } catch (e) {
    console.log(`simulate FAIL [${label}]:`, e.shortMessage || e.message);
    if (e.cause?.data) console.log('  revert data:', e.cause.data);
  }
}

// Try USDT with token-decimal usdAmount (legacy style)
const usdtAllow = await client.readContract({ address: USDT, abi: erc20, functionName: 'allowance', args: [USER, EDex] });
const usdtBal = await client.readContract({ address: USDT, abi: erc20, functionName: 'balanceOf', args: [USER] });
console.log('USDT balance:', formatUnits(usdtBal, 6), 'allowance:', formatUnits(usdtAllow, 6));

// EGuard checkTransaction (EDex calls this during buy)
try {
  await client.simulateContract({
    address: EGuard,
    abi: [
      {
        name: 'checkTransaction',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { type: 'address', name: 'sender' },
          { type: 'address', name: 'recipient' },
          { type: 'uint256', name: 'amount' },
        ],
        outputs: [],
      },
    ],
    functionName: 'checkTransaction',
    args: [USER, USER, usdAmount],
    account: EDex,
  });
  console.log('EGuard checkTransaction OK (from EDex account)');
} catch (e) {
  console.log('EGuard checkTransaction FAIL:', e.shortMessage || e.message);
  if (e.cause?.data) console.log('  data:', e.cause.data);
}

const totalSupply = await client.readContract({
  address: ERX,
  abi: [{ name: 'totalSupply', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] }],
  functionName: 'totalSupply',
});
console.log('ERX totalSupply:', formatUnits(totalSupply, 18));

for (const [label, amt, token] of [
  ['DAI 1e18 usd', usdAmount, DAI],
  ['DAI 1 token wei style', parseUnits('1', 18), DAI],
  ['USDT 1e6 usd', parseUnits('1', 6), USDT],
  ['USDT 1e18 usd', parseUnits('1', 18), USDT],
]) {
  try {
    await client.simulateContract({
      address: EDex,
      abi: edexAbi,
      functionName: 'buy',
      args: [amt, token, 0n],
      account: USER,
    });
    console.log(`simulate OK [${label}]`);
  } catch (e) {
    console.log(`simulate FAIL [${label}]:`, e.shortMessage || e.message);
  }
}
