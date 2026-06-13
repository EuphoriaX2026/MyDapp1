// Test script to verify CoinGecko API with sparkline data
const testCoinGeckoAPI = async () => {
    try {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,matic-network&order=market_cap_desc&per_page=3&page=1&sparkline=true&price_change_percentage=24h'
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log('API Response:', JSON.stringify(data, null, 2));

        // Check if sparkline data is present
        data.forEach(coin => {
            console.log(`${coin.name}:`);
            console.log(`- Current Price: $${coin.current_price}`);
            console.log(`- 24h Change: ${coin.price_change_percentage_24h}%`);
            console.log(`- Has Sparkline: ${coin.sparkline_in_7d ? 'Yes' : 'No'}`);
            if (coin.sparkline_in_7d && coin.sparkline_in_7d.price) {
                console.log(`- Sparkline Data Points: ${coin.sparkline_in_7d.price.length}`);
                console.log(`- First 5 prices: [${coin.sparkline_in_7d.price.slice(0, 5).join(', ')}]`);
            }
            console.log('');
        });

    } catch (error) {
        console.error('Error testing API:', error);
    }
};

testCoinGeckoAPI();
