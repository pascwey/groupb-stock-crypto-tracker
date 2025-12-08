/* BEGIN Pascal Cuni. */
let priceChart = null;
const assetTypeSelect = document.getElementById('assetType');
const symbolInput = document.getElementById('symbolInput');
const searchBtn = document.getElementById('searchBtn');
const priceSection = document.getElementById('priceSection');
const historicalSection = document.getElementById('historicalSection');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const homeBtn = document.getElementById('homeBtn');
const searchBtnDefaultHTML = '<i class="bi bi-search"></i> Search';
const searchBtnLoadingHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
function resetSearchBtn() {
    searchBtn.disabled = false;
    searchBtn.innerHTML = searchBtnDefaultHTML;
}
function resetToHome() {
    hideError();
    hideResults();
    symbolInput.value = '';
    if (priceChart) {
        priceChart.destroy();
        priceChart = null;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
searchBtn.addEventListener('click', handleSearch);
symbolInput.addEventListener('keypress', e => e.key === 'Enter' && handleSearch());
homeBtn.addEventListener('click', e => {
    e.preventDefault();
    resetToHome();
});
function handleSearch() {
    const symbol = symbolInput.value.trim();
    if (!symbol) {
        showError('Please enter a symbol');
        return;
    }
    hideError();
    hideResults();
    (assetTypeSelect.value === 'stock' ? fetchStockData : fetchCryptoData)(assetTypeSelect.value === 'stock' ? symbol.toUpperCase() : symbol);
}
/* END Pascal Cuni. */

/* BEGIN Agon Shehu. */
async function fetchStockData(symbol) {
    try {
        searchBtn.disabled = true;
        searchBtn.innerHTML = searchBtnLoadingHTML;
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=7d`;
        let response;
        try {
            response = await fetch(proxyUrl + encodeURIComponent(yahooUrl));
        } catch {
            showError('Network error: Unable to connect to stock data service. Please check your internet connection.');
            resetSearchBtn();
            return;
        }
        if (!response.ok) {
            showError('Unable to fetch stock data. Please try again in a moment.');
            resetSearchBtn();
            return;
        }
        let data;
        try {
            data = JSON.parse(await response.text());
        } catch {
            showError('Error parsing stock data. Please try again.');
            resetSearchBtn();
            return;
        }
        if (!data?.chart?.result?.length) {
            showError('Invalid stock symbol. Please check the symbol and try again.');
            resetSearchBtn();
            return;
        }
        const result = data.chart.result[0];
        const meta = result.meta;
        const currentPrice = parseFloat(meta.regularMarketPrice);
        if (isNaN(currentPrice) || currentPrice <= 0) {
            showError('Unable to fetch valid price data for this symbol.');
            resetSearchBtn();
            return;
        }
        let price24hAgo = parseFloat(meta.previousClose) || parseFloat(meta.chartPreviousClose) || 0;
        if (!price24hAgo || isNaN(price24hAgo)) {
            const timestamps = result.timestamp;
            const prices = result.indicators.quote[0].close;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (timestamps?.length && prices?.length) {
                for (let i = timestamps.length - 1; i >= 0; i--) {
                    const price = prices[i];
                    if (price != null && !isNaN(price) && price > 0) {
                        const priceDate = new Date(timestamps[i] * 1000);
                        priceDate.setHours(0, 0, 0, 0);
                        if (priceDate < today) {
                            price24hAgo = price;
                            break;
                        }
                    }
                }
            }
        }
        const validPrice24hAgo = price24hAgo > 0 && !isNaN(price24hAgo);
        const change = validPrice24hAgo ? currentPrice - price24hAgo : 0;
        const changePercent = validPrice24hAgo ? (change / price24hAgo) * 100 : 0;
        displayPriceData(meta.symbol, currentPrice, change, changePercent);
        fetchStockHistorical(symbol);
        resetSearchBtn();
    } catch {
        showError('Network error: Unable to fetch stock data. Please check your connection.');
        resetSearchBtn();
    }
}
/* END Agon Shehu. */

/* BEGIN Bardhyl Dervisholli. */
async function fetchCryptoData(symbol) {
    try {
        searchBtn.disabled = true;
        searchBtn.innerHTML = searchBtnLoadingHTML;
        const symbolLower = symbol.toLowerCase().trim();
        const symbolMap = {
            'btc': 'bitcoin', 'eth': 'ethereum', 'ada': 'cardano', 'doge': 'dogecoin',
            'sol': 'solana', 'xrp': 'ripple', 'dot': 'polkadot', 'matic': 'matic-network',
            'avax': 'avalanche-2', 'link': 'chainlink', 'ltc': 'litecoin', 'bch': 'bitcoin-cash',
            'xlm': 'stellar', 'atom': 'cosmos', 'algo': 'algorand'
        };
        let coinId = symbolMap[symbolLower] || symbolLower;
        let data = await (await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`)).json();
        if (!data[coinId] && symbolLower in symbolMap) {
            coinId = symbolLower;
            data = await (await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`)).json();
        }
        if (!data[coinId]) {
            showError('Invalid cryptocurrency. Try: bitcoin, ethereum, BTC, ETH, etc.');
            resetSearchBtn();
            return;
        }
        const cryptoData = data[coinId];
        const currentPrice = parseFloat(cryptoData.usd);
        const changePercent = parseFloat(cryptoData.usd_24h_change) || 0;
        if (isNaN(currentPrice) || currentPrice <= 0) {
            showError('Unable to fetch valid price data for this cryptocurrency.');
            resetSearchBtn();
            return;
        }
        const change = (currentPrice * changePercent) / 100;
        const displayName = symbolLower in symbolMap ? symbol.toUpperCase() : coinId.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
        displayPriceData(displayName, currentPrice, change, changePercent);
        fetchCryptoHistorical(coinId);
        resetSearchBtn();
    } catch {
        showError('Network error: Unable to fetch cryptocurrency data. Please check your connection.');
        resetSearchBtn();
    }
}
/* END Bardhyl Dervisholli. */

/* BEGIN Dea Gjoshi. */
const priceElements = {
    assetName: null,
    currentPrice: null,
    priceChange: null,
    changePercent: null
};
function initPriceElements() {
    if (!priceElements.assetName) {
        priceElements.assetName = document.getElementById('assetName');
        priceElements.currentPrice = document.getElementById('currentPrice');
        priceElements.priceChange = document.getElementById('priceChange');
        priceElements.changePercent = document.getElementById('changePercent');
    }
}
function displayPriceData(name, price, change, changePercent) {
    initPriceElements();
    const validPrice = isNaN(price) ? 0 : price;
    const validChange = isNaN(change) ? 0 : change;
    const validChangePercent = isNaN(changePercent) ? 0 : changePercent;
    const isPositive = validChange >= 0;
    const changeColor = isPositive ? 'text-success' : 'text-danger';
    const changeIcon = isPositive ? '↑' : '↓';
    priceElements.assetName.textContent = name;
    priceElements.currentPrice.textContent = `$${validPrice.toFixed(2)}`;
    priceElements.priceChange.innerHTML = `<span class="${changeColor}">${changeIcon} $${Math.abs(validChange).toFixed(2)}</span>`;
    priceElements.changePercent.innerHTML = `<span class="${changeColor}">${changeIcon} ${Math.abs(validChangePercent).toFixed(2)}%</span>`;
    priceSection.style.display = 'block';
}

async function fetchStockHistorical(symbol) {
    try {
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=7d`;
        const response = await fetch(proxyUrl + encodeURIComponent(yahooUrl));
        const data = await response.json();
        if (!data?.chart?.result?.length) return;
        const result = data.chart.result[0];
        const timestamps = result?.timestamp;
        const prices = result?.indicators?.quote?.[0]?.close;
        if (!timestamps?.length || !prices?.length) return;
        const datePricePairs = timestamps
            .map((timestamp, index) => {
                const price = prices[index];
                if (price == null || isNaN(price)) return null;
                const date = new Date(timestamp * 1000);
                return {
                    date,
                    price,
                    dateString: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                };
            })
            .filter(Boolean)
            .sort((a, b) => a.date - b.date);
        const datePriceMap = new Map();
        datePricePairs.forEach(({ dateString, price }) => {
            if (!datePriceMap.has(dateString)) datePriceMap.set(dateString, price);
        });
        const sortedPairs = Array.from(datePriceMap.entries()).sort((a, b) => {
            const dateA = datePricePairs.find(p => p.dateString === a[0])?.date || new Date(0);
            const dateB = datePricePairs.find(p => p.dateString === b[0])?.date || new Date(0);
            return dateA - dateB;
        });
        const last7Pairs = sortedPairs.slice(-7);
        const uniqueDates = last7Pairs.map(([date]) => date);
        const uniquePrices = last7Pairs.map(([, price]) => price);
        if (uniqueDates.length && uniquePrices.length) {
            displayHistoricalData(uniqueDates, uniquePrices, symbol);
        }
    } catch {
        showHistoricalError('Network error: Unable to fetch historical stock data.');
    }
}

async function fetchCryptoHistorical(symbolId) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${symbolId}/market_chart?vs_currency=usd&days=7`);
        const data = await response.json();
        if (!data?.prices?.length) {
            showHistoricalError('Unable to fetch historical data for this cryptocurrency');
            return;
        }
        const datePricePairs = data.prices
            .map(([timestamp, price]) => {
                if (price == null || isNaN(price)) return null;
                const date = new Date(timestamp);
                return {
                    date,
                    price,
                    dateString: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                };
            })
            .filter(Boolean)
            .sort((a, b) => a.date - b.date);
        const datePriceMap = new Map();
        datePricePairs.forEach(({ dateString, price }) => {
            const existing = datePriceMap.get(dateString);
            datePriceMap.set(dateString, existing ? (existing + price) / 2 : price);
        });
        const sortedPairs = Array.from(datePriceMap.entries()).sort((a, b) => {
            const dateA = datePricePairs.find(p => p.dateString === a[0])?.date || new Date(0);
            const dateB = datePricePairs.find(p => p.dateString === b[0])?.date || new Date(0);
            return dateA - dateB;
        });
        const last7Pairs = sortedPairs.slice(-7);
        const uniqueDates = last7Pairs.map(([date]) => date);
        const uniquePrices = last7Pairs.map(([, price]) => price);
        if (uniqueDates.length && uniquePrices.length) {
            const displayName = symbolId.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
            displayHistoricalData(uniqueDates, uniquePrices, displayName);
        }
    } catch {
        showHistoricalError('Network error: Unable to fetch historical cryptocurrency data.');
    }
}
/* END Dea Gjoshi. */

/* BEGIN Agon Shehu. */
function displayHistoricalData(dates, prices, symbol) {
    const tableBody = document.getElementById('historicalTableBody');
    tableBody.innerHTML = '';
    if (!dates.length || !prices.length) return;
    dates.forEach((date, index) => {
        const price = prices[index];
        if (price == null || isNaN(price)) return;
        const prevPrice = index > 0 ? prices[index - 1] : price;
        const change = price - prevPrice;
        const isPositive = change >= 0;
        const changeClass = isPositive ? 'text-success' : 'text-danger';
        const changeIcon = isPositive ? '↑' : '↓';
        const row = document.createElement('tr');
        row.innerHTML = `<td>${date}</td><td>$${price.toFixed(2)}</td><td class="${changeClass}">${changeIcon} $${Math.abs(change).toFixed(2)}</td>`;
        tableBody.appendChild(row);
    });
    if (priceChart) priceChart.destroy();
    const chartCanvas = document.getElementById('priceChart');
    const ctx = chartCanvas?.getContext('2d');
    if (!ctx) return;
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
                    labels: { font: { size: 14, weight: 'bold' } }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: value => '$' + value.toFixed(2),
                        font: { size: 12 }
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.1)' }
                },
                x: {
                    ticks: { font: { size: 12 } },
                    grid: { display: false }
                }
            }
        }
    });
    historicalSection.style.display = 'block';
}
/* END Agon Shehu. */

/* BEGIN Pascal Cuni. */
function showError(message) {
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
    hideResults();
}

function showHistoricalError(message) {
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
}

function hideError() {
    errorSection.style.display = 'none';
}

function hideResults() {
    priceSection.style.display = 'none';
    historicalSection.style.display = 'none';
}
/* END Pascal Cuni. */
