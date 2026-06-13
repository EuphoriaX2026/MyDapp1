// src/hooks/useTransactionHistory.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { contracts } from '../config/wagmi';
import { formatEther, parseAbiItem, Log } from 'viem';

export interface TransactionHistoryItem {
    id: string;
    type: 'buy' | 'sell' | 'send' | 'receive' | 'trade' | 'approve';
    asset: string;
    amount: string;
    value: string;
    date: string;
    rawDate: Date;
    status: 'completed' | 'pending' | 'failed';
    hash: string;
    blockNumber: number;
    fromAddress?: string;
    toAddress?: string;
    tokenAddress?: string;
    fee?: string;
}

export interface TransactionStats {
    totalSpent: string;
    totalEarned: string;
    totalTransactions: number;
}

const transferEvent = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');

const TOKENS_TO_WATCH = [
    { symbol: 'ERX', address: contracts.ERX_TOKEN },
    { symbol: 'DAI', address: contracts.DAI },
    { symbol: 'USDC', address: contracts.USDC },
    { symbol: 'USDT', address: contracts.USDT },
];

const formatDate = (date: Date): string => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const useTransactionHistory = () => {
    const { address, isConnected } = useAccount();
    const publicClient = usePublicClient();
    const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        if (!isConnected || !address || !publicClient) {
            setTransactions([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const latestBlock = await publicClient.getBlockNumber();
            const fromBlock = latestBlock > 9999n ? latestBlock - 9999n : 0n;
            
            let allLogs: Log[] = [];

            for (const token of TOKENS_TO_WATCH) {
                if (!token.address) {
                    console.warn(`Contract address for ${token.symbol} is missing.`);
                    continue;
                }
                try {
                    const sentLogs = await publicClient.getLogs({
                        address: token.address as `0x${string}`, event: transferEvent,
                        args: { from: address }, fromBlock, toBlock: 'latest'
                    });
                    const receivedLogs = await publicClient.getLogs({
                        address: token.address as `0x${string}`, event: transferEvent,
                        args: { to: address }, fromBlock, toBlock: 'latest'
                    });
                    allLogs.push(...sentLogs, ...receivedLogs);
                } catch (tokenError) {
                    console.error(`Failed to fetch logs for ${token.symbol}:`, tokenError);
                }
            }

            const uniqueLogs = Array.from(new Map(allLogs.map(log => [log.transactionHash, log])).values());

            const formattedTransactions = await Promise.all(
                uniqueLogs.map(async (log) => {
                    const args = (log as any).args as { from?: string, to?: string, value?: bigint };
                    if (!args || !args.from || !args.to || typeof args.value === 'undefined' || log.blockNumber === null) return null;

                    const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
                    const token = TOKENS_TO_WATCH.find(t => t.address?.toLowerCase() === log.address.toLowerCase());
                    
                    return {
                        id: log.transactionHash,
                        hash: log.transactionHash,
                        type: args.to.toLowerCase() === address.toLowerCase() ? 'receive' : 'send',
                        asset: token?.symbol || 'UNKNOWN',
                        amount: parseFloat(formatEther(args.value)).toFixed(4),
                        value: `$${(parseFloat(formatEther(args.value)) * 1).toFixed(2)}`,
                        date: formatDate(new Date(Number(block.timestamp) * 1000)),
                        rawDate: new Date(Number(block.timestamp) * 1000),
                        status: 'completed',
                        blockNumber: Number(log.blockNumber),
                        fromAddress: args.from,
                        toAddress: args.to,
                        tokenAddress: log.address,
                        fee: '0.001 MATIC' // Placeholder/Estimated
                    } as TransactionHistoryItem;
                })
            );

            const validTxs = formattedTransactions
                .filter((tx): tx is TransactionHistoryItem => tx !== null)
                .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
            
            setTransactions(validTxs);

        } catch (err) {
            console.error("Error during transaction fetch process:", err);
            setError("Failed to fetch transaction history.");
        } finally {
            setIsLoading(false);
        }
    }, [address, isConnected, publicClient]);

    useEffect(() => {
        if (isConnected && address) {
            fetchTransactions();
        } else {
            setIsLoading(false);
        }
    }, [isConnected, address, fetchTransactions]);
    
    const transactionStats = useMemo((): TransactionStats => {
        const stats = transactions.reduce((acc, tx) => {
            const value = parseFloat(tx.value.replace('$', ''));
            if (tx.type === 'send' || tx.type === 'sell' || tx.type === 'approve' || tx.type === 'trade') acc.totalSpent += value;
            else if (tx.type === 'receive' || tx.type === 'buy') acc.totalEarned += value;
            return acc;
        }, { totalSpent: 0, totalEarned: 0, totalTransactions: transactions.length });
        
        return {
            totalSpent: `$${stats.totalSpent.toFixed(2)}`,
            totalEarned: `$${stats.totalEarned.toFixed(2)}`,
            totalTransactions: transactions.length,
        };
    }, [transactions]);
    
    const groupedTransactions = useMemo(() => {
        const groups: { [key: string]: TransactionHistoryItem[] } = {};
        transactions.forEach(tx => {
            if (!groups[tx.date]) {
                groups[tx.date] = [];
            }
            groups[tx.date].push(tx);
        });
        return groups;
    }, [transactions]);

    return {
        transactions,
        groupedTransactions,
        transactionStats,
        isLoading,
        error,
        loadTransactions: fetchTransactions,
        getTransactionIcon: (type: TransactionHistoryItem['type']): string => {
            if (type === 'receive' || type === 'buy') return 'lucide:arrow-down';
            return 'lucide:arrow-up';
        },
        getTransactionColor: (type: TransactionHistoryItem['type']) => {
            return (type === 'receive' || type === 'buy') ? 'success' : 'warning';
        },
        getStatusColor: (status: TransactionHistoryItem['status']) => {
             switch (status) {
                case 'completed': return 'success';
                case 'pending': return 'warning';
                case 'failed': return 'danger';
                default: return 'medium';
            }
        }
    };
};