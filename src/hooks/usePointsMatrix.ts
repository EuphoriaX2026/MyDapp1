import { useReadContracts, useAccount } from 'wagmi'
import { contracts } from '../config/wagmi'
import LensABI from '../abis/Lens-titan.json'
import LedgerABI from '../abis/Ledger-titan.json'

// Definition of the structure we want to return for each group
export interface GroupPointsData {
  groupIdx: number;
  rawLeft: bigint;
  rawRight: bigint;
  paidLeft: bigint;
  paidRight: bigint;
  pendingLeft: bigint;
  pendingRight: bigint;
  balancesCreated: bigint;
}

export function usePointsMatrix() {
  const { address } = useAccount()

  // Generate multicall configurations for groups 1 through 7
  const lensCalls = Array.from({ length: 7 }, (_, i) => ({
    address: contracts.TITAN_LENS as `0x${string}`,
    abi: LensABI.abi, // Assuming standard Hardhat/Foundry ABI output structure
    functionName: 'getPointLedger',
    args: [address, i + 1],
  }))

  const ledgerCalls = Array.from({ length: 7 }, (_, i) => ({
    address: contracts.TITAN_LEDGER as `0x${string}`,
    abi: LedgerABI.abi,
    functionName: 'userPendingPoints',
    args: [address, i + 1],
  }))

  // Combine calls into a single array for useReadContracts
  const allCalls = [...lensCalls, ...ledgerCalls]

  // Execute Multicall
  const { data, isError, isLoading, refetch } = useReadContracts({
    contracts: allCalls,
    query: { enabled: !!address },
  })

  // Format the returned data
  const groupsData: Record<number, GroupPointsData> = {}

  if (data && address) {
    for (let i = 1; i <= 7; i++) {
        // Expected from Lens getPointLedger[User, GroupIdx] returns (uint256 rawLeft, uint256 rawRight, uint256 paidLeft, uint256 paidRight)
        const lensResult = data[i - 1]?.result as unknown as readonly [bigint, bigint, bigint, bigint] | undefined
        // Expected from Ledger userPendingPoints[User, GroupIdx] returns (PendingPoints struct { left: uint256, right: uint256, weekId: uint256 })
        const ledgerResult = data[7 + (i - 1)]?.result as unknown as { left: bigint, right: bigint, weekId: bigint } | undefined

        // Parse Lens points
        const rawLeft = lensResult?.[0] || 0n
        const rawRight = lensResult?.[1] || 0n
        const paidLeft = lensResult?.[2] || 0n
        const paidRight = lensResult?.[3] || 0n

        // Parse Ledger pending points
        const pendingLeft = ledgerResult?.left || 0n
        const pendingRight = ledgerResult?.right || 0n

        // Balances created is fundamentally the paidLeft amount (which equals paidRight generally per collision)
        // Since paidLeft represents successfully paid out points on the left leg, we use it as total collision/balance count
        const balancesCreated = paidLeft

        groupsData[i] = {
            groupIdx: i,
            rawLeft,
            rawRight,
            paidLeft,
            paidRight,
            pendingLeft,
            pendingRight,
            balancesCreated
        }
    }
  } else {
    // If no data or not connected, return empty/zero initial data for 7 groups
    for (let i = 1; i <= 7; i++) {
        groupsData[i] = {
            groupIdx: i,
            rawLeft: 0n,
            rawRight: 0n,
            paidLeft: 0n,
            paidRight: 0n,
            pendingLeft: 0n,
            pendingRight: 0n,
            balancesCreated: 0n
        }
    }
  }

  return {
    groupsData,
    isLoading,
    isError,
    refetch
  }
}
