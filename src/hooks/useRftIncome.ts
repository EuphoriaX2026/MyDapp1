import { useMemo } from 'react';
import { useReadContracts, useAccount } from 'wagmi';
import { contracts } from '../config/wagmi';
import LedgerABI from '../abis/Ledger-titan.json';
import { useProtocolWeek } from './useProtocolWeek';

export function useRftIncome() {
    const { address } = useAccount();

    const {
        oneWeek,
        currentWeekId,
        userStartWeekId,
        minSelectableWeekId,
        maxSelectableWeekId,
        isLoading: isWeekMetaLoading,
    } = useProtocolWeek();

    const startWeekId = userStartWeekId;
    
    // Ensure we don't query thousands of blocks if user is new
    // We limit history calls up to 100 weeks maximum to prevent payload errors
    const diff = Number(currentWeekId - startWeekId);
    const numWeeksToQuery = isNaN(diff) || diff < 0 ? 0 : Math.min(diff + 1, 100); 

    const weeksToFetch = useMemo(() => {
        const arr = [];
        if (numWeeksToQuery > 0) {
            for (let i = 0; i < numWeeksToQuery; i++) {
                arr.push(startWeekId + BigInt(i));
            }
        }
        return arr;
    }, [startWeekId, numWeeksToQuery]);

    // Format multicall to fetch weeklyUsdClaimedTotal for all relevant weeks
    const ledgerCalls = weeksToFetch.map(wId => ({
        address: contracts.TITAN_LEDGER as `0x${string}`,
        abi: LedgerABI.abi,
        functionName: 'weeklyUsdClaimedTotal',
        args: [address, wId]
    }));

    const { data: weeklyClaimedData, isLoading: isLedgerLoading } = useReadContracts({
        contracts: ledgerCalls,
        query: {
            enabled: !!address && ledgerCalls.length > 0
        }
    });

    // Calculate Totals
    let totalIncomeUSD = 0n;
    let lastWeekIncomeUSD = 0n;

    if (weeklyClaimedData && address) {
        weeklyClaimedData.forEach((result, idx) => {
            if (result.status === 'success' && result.result) {
                const claimed = result.result as bigint;
                totalIncomeUSD += claimed;

                // Is it last week?
                if (weeksToFetch[idx] === currentWeekId - 1n) {
                    lastWeekIncomeUSD = claimed;
                }
            }
        });
    }

    return {
        totalIncomeUSD,
        lastWeekIncomeUSD,
        currentWeekId,
        userStartWeekId,
        minSelectableWeekId,
        maxSelectableWeekId,
        isLoading: isWeekMetaLoading || isLedgerLoading,
    };
}
