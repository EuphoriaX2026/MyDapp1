// src/components/PortfolioList.tsx

import { formatUnits } from 'viem';
import { formatErxPrice, formatFinancialNumber } from '../utils/formatNumber';

// Definition of input data types (Props)
interface AssetData {
    amount: string;
    value: string;
}

interface Breakdown {
    native: AssetData;
    erx: AssetData;
    qbit: AssetData;
    dai: AssetData;
    usdc: AssetData;
    [key: string]: AssetData;
}

interface PolygonData {
    current_price: number;
}

interface PortfolioListProps {
    isPricesLoading: boolean;
    currentERXPrice: bigint | undefined;
    currentQBITPrice: bigint | undefined;
    breakdown: Breakdown | null;
    polygon: PolygonData | null;
}

export const PortfolioList = ({
    isPricesLoading,
    currentERXPrice,
    currentQBITPrice,
    breakdown,
    polygon
}: PortfolioListProps) => {
    // If breakdown doesn't exist, render nothing to prevent error
    if (!breakdown) {
        return null;
    }

    const assetsToDisplay = [
        { symbol: 'ERX', price: currentERXPrice ? formatUnits(currentERXPrice, 18) : '0.00' },
        { symbol: 'QBit', price: currentQBITPrice ? formatUnits(currentQBITPrice, 18) : '0.00' },
        { symbol: 'POL', price: polygon?.current_price ? polygon.current_price.toFixed(2) : '0.00' },
        { symbol: 'DAI', price: '1.00' },
        { symbol: 'USDC', price: '1.00' }
    ];
    
    return (
        <div className="section mt-4">
            <div className="section-heading">
                <h2 className="title">
                    Portfolio
                    {(isPricesLoading || !currentERXPrice || !currentQBITPrice) && (
                        <small className="text-muted ms-2">
                            <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
                        </small>
                    )}
                </h2>
            </div>
            <div className="card">
                <ul className="listview flush transparent no-line image-listview detailed-list mt-1 mb-1">
                    {assetsToDisplay.map((asset) => {
                        let assetData;
                        if (asset.symbol.toLowerCase() === 'pol') {
                            assetData = breakdown.native;
                        } else {
                            assetData = breakdown[asset.symbol.toLowerCase()];
                        }
                        if (!assetData || !assetData.amount || parseFloat(assetData.amount) === 0) {
                            return null;
                        }
                        return (
                            <li key={asset.symbol}>
                                <div className="item">
                                    <div className="in">
                                        <div>
                                            <strong>{asset.symbol}</strong>
                                            <div className="text-small text-secondary">
                                                $
                                                {asset.symbol === 'ERX'
                                                  ? formatErxPrice(parseFloat(asset.price))
                                                  : formatFinancialNumber(parseFloat(asset.price), {
                                                      minimumFractionDigits: 2,
                                                      maximumFractionDigits: 2,
                                                    })}
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <strong>
                                                {formatFinancialNumber(parseFloat(assetData.amount), {
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 2,
                                                })}{' '}
                                                {asset.symbol}
                                            </strong>
                                            <div className="text-small">
                                                $ {parseFloat(assetData.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};