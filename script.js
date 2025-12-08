/* BEGIN Member 3. */
let priceChart = null;
const assetTypeSelect = document.getElementById('assetType');
const symbolInput = document.getElementById('symbolInput');
const searchBtn = document.getElementById('searchBtn');
const priceSection = document.getElementById('priceSection');
const historicalSection = document.getElementById('historicalSection');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
searchBtn.addEventListener('click', handleSearch);
symbolInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleSearch();
    }
});
function handleSearch() {
    const assetType = assetTypeSelect.value;
    let symbol = symbolInput.value.trim();
    if (!symbol) {
        showError('Please enter a symbol');
        return;
    }
    hideError();
    hideResults();
    if (assetType === 'stock') {
        symbol = symbol.toUpperCase();
        fetchStockData(symbol);
    } else {
        fetchCryptoData(symbol);
    }
}
/* END Member 3. */

/* BEGIN Member 1. */
async function fetchStockData(symbol) {
    try {
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
        
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=7d`;
        
        let response;
        try {
            response = await fetch(proxyUrl + encodeURIComponent(yahooUrl));
        } catch (fetchError) {
            showError('Network error: Unable to connect to stock data service. Please check your internet connection.');
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<i class="bi bi-search"></i> Search';
            return;
        }
        
        if (!response.ok) {
            showError('Unable to fetch stock data. Please try again in a moment.');
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<i class="bi bi-search"></i> Search';
            return;
        }
        
        let data;
        try {
            const responseText = await response.text();
            data = JSON.parse(responseText);
        } catch (parseError) {
            showError('Error parsing stock data. Please try again.');
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<i class="bi bi-search"></i> Search';
            return;
        }
        
        if (!data || !data.chart || !data.chart.result || data.chart.result.length === 0) {
            showError('Invalid stock symbol. Please check the symbol and try again.');
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<i class="bi bi-search"></i> Search';
            return;
        }
        
        const result = data.chart.result[0];
        const meta = result.meta;
        const currentPrice = parseFloat(meta.regularMarketPrice);
        
        if (isNaN(currentPrice) || currentPrice <= 0) {
            showError('Unable to fetch valid price data for this symbol.');
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<i class="bi bi-search"></i> Search';
            return;
        }
        
        let price24hAgo = parseFloat(meta.previousClose) || parseFloat(meta.chartPreviousClose) || 0;
        
        if (price24hAgo === 0 || isNaN(price24hAgo)) {
            const timestamps = result.timestamp;
            const prices = result.indicators.quote[0].close;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (timestamps && prices && prices.length > 0) {
                for (let i = timestamps.length - 1; i >= 0; i--) {
                    if (prices[i] !== null && prices[i] !== undefined && !isNaN(prices[i]) && prices[i] > 0) {
                        const priceDate = new Date(timestamps[i] * 1000);
                        priceDate.setHours(0, 0, 0, 0);
                        
                        if (priceDate.getTime() < today.getTime()) {
                            price24hAgo = parseFloat(prices[i]);
                            break;
                        }
                    }
                }
            }
        }
        
        const change = (price24hAgo > 0 && !isNaN(price24hAgo)) ? currentPrice - price24hAgo : 0;
        const changePercent = (price24hAgo > 0 && !isNaN(price24hAgo)) ? (change / price24hAgo) * 100 : 0;
        
        displayPriceData(meta.symbol, currentPrice, change, changePercent);
        fetchStockHistorical(symbol);
        
        searchBtn.disabled = false;
        searchBtn.innerHTML = '<i class="bi bi-search"></i> Search';
        
    } catch (error) {
        showError('Network error: Unable to fetch stock data. Please check your connection.');
        searchBtn.disabled = false;
        searchBtn.innerHTML = '<i class="bi bi-search"></i> Search';
    }
}

/* BEGIN Member 2. */
async function fetchCryptoData(symbol) {
    try {
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
        
        const symbolLower = symbol.toLowerCase().trim();
        const symbolMap = {
            'btc': 'bitcoin',
            'eth': 'ethereum',
            'ada': 'cardano',
            'doge': 'dogecoin',
            'sol': 'solana',
            'xrp': 'ripple',
            'dot': 'polkadot',
            'matic': 'matic-network',
            'avax': 'avalanche-2',
            'link': 'chainlink',
            'ltc': 'litecoin',
            'bch': 'bitcoin-cash',
            'xlm': 'stellar',
            'atom': 'cosmos',
            'algo': 'algorand'
        };
        
        let coinId = symbolMap[symbolLower] || symbolLower;
        let response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`);
        let data = await response.json();
        
        if (!data[coinId] && symbolLower in symbolMap) {
            coinId = symbolLower;
            response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`);
            data = await response.json();
        }
        
        if (!data[coinId]) {
            showError('Invalid cryptocurrency. Try: bitcoin, ethereum, BTC, ETH, etc.');
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<i class="bi bi-search"></i> Search';
            return;
        }
        
        const cryptoData = data[coinId];
        const currentPrice = parseFloat(cryptoData.usd);
        const changePercent = parseFloat(cryptoData.usd_24h_change) || 0;
        
        if (isNaN(currentPrice) || currentPrice <= 0) {
            showError('Unable to fetch valid price data for this cryptocurrency.');
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<i class="bi bi-search"></i> Search';
            return;
        }
        
        const change = (currentPrice * changePercent) / 100;
        const displayName = symbolLower in symbolMap ? symbol.toUpperCase() : coinId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        displayPriceData(displayName, currentPrice, change, changePercent);
        fetchCryptoHistorical(coinId);
        
        searchBtn.disabled = false;
        searchBtn.innerHTML = '<i class="bi bi-search"></i> Search';
        
    } catch (error) {
        showError('Network error: Unable to fetch cryptocurrency data. Please check your connection.');
        searchBtn.disabled = false;
        searchBtn.innerHTML = '<i class="bi bi-search"></i> Search';
    }
}
/* END Member 2. */

/* BEGIN Member 4. */
function displayPriceData(name, price, change, changePercent) {
    const validPrice = isNaN(price) ? 0 : price;
    const validChange = isNaN(change) ? 0 : change;
    const validChangePercent = isNaN(changePercent) ? 0 : changePercent;
    
    document.getElementById('assetName').textContent = name;
    document.getElementById('currentPrice').textContent = `$${validPrice.toFixed(2)}`;
    
    const changeColor = validChange >= 0 ? 'text-success' : 'text-danger';
    const changeIcon = validChange >= 0 ? '↑' : '↓';
    
    document.getElementById('priceChange').innerHTML = `<span class="${changeColor}">${changeIcon} $${Math.abs(validChange).toFixed(2)}</span>`;
    document.getElementById('changePercent').innerHTML = `<span class="${changeColor}">${changeIcon} ${Math.abs(validChangePercent).toFixed(2)}%</span>`;
    
    priceSection.style.display = 'block';
}

async function fetchStockHistorical(symbol) {
    try {
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=7d`;
        const response = await fetch(proxyUrl + encodeURIComponent(yahooUrl));
        const data = await response.json();
        
        if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
            return;
        }
        
        const result = data.chart.result[0];
        const timestamps = result.timestamp;
        const prices = result.indicators.quote[0].close;
        
        const datePricePairs = [];
        timestamps.forEach((timestamp, index) => {
            if (prices[index] !== null && prices[index] !== undefined && !isNaN(prices[index])) {
                const date = new Date(timestamp * 1000);
                datePricePairs.push({
                    date: date,
                    price: prices[index],
                    dateString: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                });
            }
        });
        
        datePricePairs.sort((a, b) => a.date - b.date);
        
        const datePriceMap = new Map();
        datePricePairs.forEach(pair => {
            if (!datePriceMap.has(pair.dateString)) {
                datePriceMap.set(pair.dateString, pair.price);
            }
        });
        
        const sortedPairs = Array.from(datePriceMap.entries()).sort((a, b) => {
            const dateA = datePricePairs.find(p => p.dateString === a[0])?.date || new Date(0);
            const dateB = datePricePairs.find(p => p.dateString === b[0])?.date || new Date(0);
            return dateA - dateB;
        });
        
        const last7Pairs = sortedPairs.slice(-7);
        const uniqueDates = last7Pairs.map(pair => pair[0]);
        const uniquePrices = last7Pairs.map(pair => pair[1]);
        
        if (uniqueDates.length > 0 && uniquePrices.length > 0) {
            displayHistoricalData(uniqueDates, uniquePrices, symbol);
        }
        
    } catch (error) {
        showError('Network error: Unable to fetch historical stock data.');
    }
}

async function fetchCryptoHistorical(symbolId) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${symbolId}/market_chart?vs_currency=usd&days=7`);
        const data = await response.json();
        
        if (!data.prices || data.prices.length === 0) {
            showError('Unable to fetch historical data for this cryptocurrency');
            return;
        }
        
        const datePricePairs = [];
        data.prices.forEach(item => {
            if (item[1] !== null && item[1] !== undefined && !isNaN(item[1])) {
                const date = new Date(item[0]);
                datePricePairs.push({
                    date: date,
                    price: item[1],
                    dateString: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                });
            }
        });
        
        datePricePairs.sort((a, b) => a.date - b.date);
        
        const datePriceMap = new Map();
        datePricePairs.forEach(pair => {
            if (!datePriceMap.has(pair.dateString)) {
                datePriceMap.set(pair.dateString, pair.price);
            } else {
                const existingPrice = datePriceMap.get(pair.dateString);
                datePriceMap.set(pair.dateString, (existingPrice + pair.price) / 2);
            }
        });
        
        const sortedPairs = Array.from(datePriceMap.entries()).sort((a, b) => {
            const dateA = datePricePairs.find(p => p.dateString === a[0])?.date || new Date(0);
            const dateB = datePricePairs.find(p => p.dateString === b[0])?.date || new Date(0);
            return dateA - dateB;
        });
        
        const last7Pairs = sortedPairs.slice(-7);
        const uniqueDates = last7Pairs.map(pair => pair[0]);
        const uniquePrices = last7Pairs.map(pair => pair[1]);
        
        if (uniqueDates.length > 0 && uniquePrices.length > 0) {
            const displayName = symbolId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            displayHistoricalData(uniqueDates, uniquePrices, displayName);
        }
        
    } catch (error) {
        showError('Network error: Unable to fetch historical cryptocurrency data.');
    }
}
/* END Member 4. */

/* BEGIN Member 1. */
function displayHistoricalData(dates, prices, symbol) {
    const tableBody = document.getElementById('historicalTableBody');
    tableBody.innerHTML = '';
    
    if (dates.length === 0 || prices.length === 0) {
        return;
    }
    
    dates.forEach((date, index) => {
        const price = prices[index];
        if (price === null || price === undefined || isNaN(price)) {
            return;
        }
        
        const prevPrice = index > 0 ? prices[index - 1] : price;
        const change = price - prevPrice;
        const changeClass = change >= 0 ? 'text-success' : 'text-danger';
        const changeIcon = change >= 0 ? '↑' : '↓';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${date}</td>
            <td>$${price.toFixed(2)}</td>
            <td class="${changeClass}">${changeIcon} $${Math.abs(change).toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
    });
    
    if (priceChart) {
        priceChart.destroy();
    }
    
    const ctx = document.getElementById('priceChart').getContext('2d');
    const isPositive = prices.length > 0 && prices[prices.length - 1] >= prices[0];
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(13, 110, 253, 0.3)');
    gradient.addColorStop(1, 'rgba(13, 110, 253, 0.05)');
    
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: `${symbol} Price (USD)`,
                data: prices,
                borderColor: 'rgb(13, 110, 253)',
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: 'rgb(13, 110, 253)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        },
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    historicalSection.style.display = 'block';
}
/* END Member 1. */

/* BEGIN Member 5. */
function showError(message) {
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
    hideResults();
}

function hideError() {
    errorSection.style.display = 'none';
}

function hideResults() {
    priceSection.style.display = 'none';
    historicalSection.style.display = 'none';
}
/* END Member 5. */
