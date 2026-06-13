import React from 'react'
import { useEuphoriaExchange, type StablecoinMetadata } from '../hooks/useEuphoriaExchange'
import { type Address } from 'viem'

export const USDCDistinctionTest: React.FC = () => {
    const { stablecoinAddresses, getStablecoinWithMetadata } = useEuphoriaExchange()

    if (!stablecoinAddresses) {
        return <div>Loading stablecoins...</div>
    }

    const sortedStablecoins = (stablecoinAddresses || [])
        .map((address: string) => ({ address, metadata: getStablecoinWithMetadata(address) as StablecoinMetadata }))
        .sort((a: any, b: any) => a.metadata.priority - b.metadata.priority)

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>USDC Distinction Test</h2>
            <p>This test verifies that USDC native and USDC.e are properly distinguished.</p>
            
            <div style={{ marginTop: '20px' }}>
                <h3>Loaded Stablecoins ({stablecoinAddresses?.length || 0} total)</h3>
                {sortedStablecoins.length === 0 ? (
                    <p style={{ color: '#999' }}>No stablecoins loaded yet.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f5f5f5' }}>
                                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Priority</th>
                                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Display Symbol</th>
                                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Display Name</th>
                                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Address</th>
                                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Decimals</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedStablecoins.map(({ address, metadata }: any) => (
                                <tr key={address}>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{metadata.priority}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                                        {metadata.symbol}
                                    </td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{metadata.name}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd', fontFamily: 'monospace', fontSize: '12px' }}>
                                        {address}
                                    </td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{metadata.decimals}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div style={{ marginTop: '30px' }}>
                <h3>Expected Results</h3>
                <ul>
                    <li><strong>USDC</strong> (Native) should appear first with priority 1</li>
                    <li><strong>USDC.e</strong> (Bridged) should appear second with priority 2</li>
                    <li>Both should have 6 decimals</li>
                    <li>Addresses should match the known USDC contracts</li>
                </ul>
            </div>

            <div style={{ marginTop: '30px' }}>
                <h3>Dropdown Simulation</h3>
                <label htmlFor="usdc-test-select">Select USDC Token:</label>
                <select id="usdc-test-select" style={{ marginLeft: '10px', padding: '5px', minWidth: '200px' }}>
                    <option value="">-- Select Token --</option>
                    {sortedStablecoins.map(({ address, metadata }: any) => (
                        <option key={address} value={address}>
                            {metadata.symbol}
                        </option>
                    ))}
                </select>
                <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                    This simulates how the tokens appear in the actual dropdowns.
                </p>
            </div>
        </div>
    )
}

export default USDCDistinctionTest
