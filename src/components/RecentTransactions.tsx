// src/components/RecentTransactions.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { AppIcon } from './icons/AppIcon';
import { useTransactionHistory } from '../hooks/useTransactionHistory';

export const RecentTransactions: React.FC = () => {
    const { transactions, isLoading, error, getTransactionIcon, getTransactionColor } = useTransactionHistory();

    const displayTransactions = transactions.slice(0, 4);

    return (
        <div className="section mt-4">
            <div className="section-heading">
                <h2 className="title">Recent Transactions</h2>
                <Link to="/transactions" className="link">View All</Link>
            </div>
            <div className="card">
                <ul className="listview flush transparent no-line image-listview detailed-list mt-1 mb-1">
                    {isLoading && <li className='p-2 text-center text-muted'>Loading...</li>}
                    {error && <li className='p-2 alert alert-outline-danger m-2'>{error}</li>}
                    {!isLoading && !error && displayTransactions.length === 0 && (
                        <li className="p-2 text-center text-muted">No recent transactions found.</li>
                    )}
                    {!isLoading && !error && displayTransactions.map((tx) => {
                        const color = getTransactionColor(tx.type);
                        const icon = getTransactionIcon(tx.type);
                        return (
                            <li key={tx.id}>
                                <a href={`https://polygonscan.com/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="item">
                                    <div className={`icon-box bg-${color}`}>
                                        <AppIcon icon={icon} />
                                    </div>
                                    <div className="in">
                                        <div>
                                            <strong>{tx.asset}</strong>
                                            <div className="text-small text-secondary">{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</div>
                                        </div>
                                        <div className="text-end">
                                            <strong className={`text-${color}`}>
                                                {tx.type === 'receive' ? '+' : '-'} {tx.amount} {tx.asset}
                                            </strong>
                                            <div className="text-small">{tx.date}</div>
                                        </div>
                                    </div>
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};
