import { useReadContract, useReadContracts, useAccount } from 'wagmi';
import { contracts } from '../config/wagmi';
import LensABI from '../abis/Lens-titan.json';
import LedgerABI from '../abis/Ledger-titan.json';

export function useTeamReport() {
    const { address } = useAccount();

    // 1. G1 Partners (Left and Right points + paid points)
    const { data: g1Ledger, isLoading: isLoadingG1 } = useReadContract({
        address: contracts.TITAN_LENS as `0x${string}`,
        abi: LensABI.abi,
        functionName: 'getPointLedger',
        args: [address, 1], // Group 1
        query: { enabled: !!address }
    });

    // 2. This week RFT (Total RFT shares generated across all groups)
    const { data: totalRftShares, isLoading: isLoadingRft } = useReadContract({
        address: contracts.TITAN_LEDGER as `0x${string}`,
        abi: LedgerABI.abi,
        functionName: 'userTotalRftBaseShares',
        args: [address],
        query: { enabled: !!address }
    });

    // 3. Points pending (Total pending points across all groups)
    const { data: totalPending, isLoading: isLoadingPending } = useReadContract({
        address: contracts.TITAN_LENS as `0x${string}`,
        abi: LensABI.abi,
        functionName: 'getUserTotalPendingPoints',
        args: [address],
        query: { enabled: !!address }
    });

    // Calculate Partners (Raw + Paid for Left and Right in G1)
    let partnersLeft = 0n;
    let partnersRight = 0n;

    if (g1Ledger) {
        const [rawLeft, rawRight, paidLeft, paidRight] = g1Ledger as [bigint, bigint, bigint, bigint];
        partnersLeft = rawLeft + paidLeft;
        partnersRight = rawRight + paidRight;
    }

    // Parse RFT and Pending
    const rftShares = totalRftShares ? (totalRftShares as bigint) : 0n;
    
    let pendingLeft = 0n;
    let pendingRight = 0n;
    if (totalPending) {
        const [pLeft, pRight] = totalPending as [bigint, bigint];
        pendingLeft = pLeft;
        pendingRight = pRight;
    }
    const totalPendingAmount = pendingLeft + pendingRight;

    return {
        partnersLeft,
        partnersRight,
        totalRftShares: rftShares,
        totalPendingPoints: totalPendingAmount,
        isLoading: isLoadingG1 || isLoadingRft || isLoadingPending
    };
}
