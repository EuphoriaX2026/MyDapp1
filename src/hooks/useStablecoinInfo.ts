import { useReadContracts } from 'wagmi'
import { type Address } from 'viem'
import { ERC20_ABI } from '../config/wagmi'
import { useAccount } from 'wagmi'

export interface StablecoinInfo {
    address: Address
    symbol: string
    name: string
    decimals: number
    balance: bigint
}

export const useStablecoinInfo = (tokenAddress: Address | undefined): StablecoinInfo | null => {
    const { address } = useAccount()

    const { data: results } = useReadContracts({
        contracts: [
            {
                address: tokenAddress,
                abi: ERC20_ABI,
                functionName: 'symbol',
            },
            {
                address: tokenAddress,
                abi: ERC20_ABI,
                functionName: 'name',
            },
            {
                address: tokenAddress,
                abi: ERC20_ABI,
                functionName: 'decimals',
            },
            {
                address: tokenAddress,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [address || '0x0'],
            },
        ],
        query: {
            enabled: !!tokenAddress && tokenAddress !== '0x0' && !!address,
        },
    })

    if (!tokenAddress || !results) return null

    const symbol = results[0]?.result as string
    const name = results[1]?.result as string
    const decimals = results[2]?.result as number
    const balance = results[3]?.result as bigint

    if (!symbol || decimals === undefined || balance === undefined) {
        return null
    }

    return {
        address: tokenAddress,
        symbol,
        name: name || symbol,
        decimals,
        balance,
    }
}
