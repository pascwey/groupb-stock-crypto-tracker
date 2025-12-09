# 📈 Stock & Cryptocurrency Tracker

A real-time web application for tracking stock and cryptocurrency prices with historical data visualization. Built with vanilla JavaScript, HTML5, CSS3, and Bootstrap 5.

![Project Status](https://img.shields.io/badge/status-complete-success)
![Languages](https://img.shields.io/badge/languages-JavaScript%20%7C%20HTML%20%7C%20CSS-blue)

## 🌐 Live Demo

**Try it now:** [https://pascwey.github.io/groupb-stock-crypto-tracker/](https://pascwey.github.io/groupb-stock-crypto-tracker/)

## 🎯 Features

- **Real-time Price Tracking**: Get current prices for stocks and cryptocurrencies
- **Historical Data**: View 7-day price history with interactive charts
- **Visual Charts**: Beautiful Chart.js line graphs showing price trends
- **Responsive Design**: Mobile-friendly interface with Bootstrap 5
- **Error Handling**: Comprehensive error messages and validation with separate handling for historical data errors
- **Modern UI**: Gradient backgrounds, smooth animations, and intuitive design
- **Home Button**: Reset functionality to clear results and return to top

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- An internet connection (for API calls)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/pascwey/groupb-stock-crypto-tracker.git
cd groupb-stock-crypto-tracker
```

2. Open `index.html` in your web browser:
   - Double-click the file, or
   - Use a local server (e.g., `python -m http.server` or `npx serve`)

3. Start tracking! Enter a stock symbol (e.g., AAPL, MSFT) or cryptocurrency (e.g., BTC, ETH, bitcoin)

## 📁 Project Structure

```
groupb-stock-crypto-tracker/
│
├── index.html              # Main HTML structure
├── script.js               # JavaScript functionality
├── styles.css              # CSS styling
├── README.md              # Project documentation
└── .github/
    └── workflows/
        └── deploy.yml     # GitHub Pages deployment workflow
```

## 🏗️ Architecture

### APIs Used

- **Stocks**: Yahoo Finance API (via AllOrigins proxy)
- **Cryptocurrencies**: CoinGecko API

### Technologies

- **Frontend Framework**: Vanilla JavaScript (ES6+)
- **CSS Framework**: Bootstrap 5.3.0
- **Charts**: Chart.js 4.4.0
- **Icons**: Bootstrap Icons 1.11.0

## 👥 Team Members & Contributions

### Agon Shehu
**Responsibilities:**
- **Stock Data Fetching** (`script.js` lines 45-117)
  - Yahoo Finance API integration
  - Proxy handling for CORS
  - Price calculation and validation
  - 24h change calculation

- **Historical Chart Display** (`script.js` lines 279-356)
  - Chart.js integration and configuration
  - Historical data visualization
  - Chart styling and customization

- **Base Styles** (`styles.css` lines 1-35)
  - Body layout and gradient background
  - Card animations and hover effects
  - Overall page structure

---

### Bardhyl Dervisholli
**Responsibilities:**
- **Cryptocurrency Data Fetching** (`script.js` lines 119-160)
  - CoinGecko API integration
  - Symbol mapping (BTC → bitcoin, etc.)
  - Fallback logic for symbol matching
  - Crypto price data parsing

- **Price Card Styling** (`styles.css` lines 37-68)
  - Gradient price card design
  - Glassmorphism effects
  - Price box styling and animations

---

### Dea Gjoshi
**Responsibilities:**
- **Price Display Function** (`script.js` lines 162-177)
  - Formatting and displaying current price
  - Change percentage calculation
  - Color coding (green/red) for gains/losses

- **Historical Data Fetching** (`script.js` lines 179-277)
  - Stock historical data fetching
  - Cryptocurrency historical data fetching
  - Data processing and date formatting
  - Last 7 days data extraction

- **Table & Button Styling** (`styles.css` lines 93-129)
  - Historical table styling
  - Button hover effects
  - Responsive table design

---

### Erin Kupina
**Responsibilities:**
- **All HTML Content** (`index.html` lines 32-139)
  - Search form layout
  - Asset type selector
  - Input field and search button
  - Current price display cards
  - 24h price change and percentage sections
  - Historical section with chart container and data table
  - Error message display area
  - Footer with group member names
  - Bootstrap and script includes

---

### Pascal Cuni
**Responsibilities:**
- **HTML Structure & Navigation** (`index.html` lines 3-29)
  - HTML head section with meta tags and CDN links
  - Bootstrap navigation bar
  - Project setup and structure
  
- **UI Initialization & Event Handlers** (`script.js` lines 1-43, `styles.css` lines 70-91)
  - DOM element selection and initialization
  - Search button click event listener
  - Enter key press handler for search input
  - Home button click handler
  - Main search handler function (`handleSearch`)
  - CSS for navbar and chart container styling

- **Error Handling & Utilities** (`script.js` lines 358-378, `styles.css` lines 131-193)
  - Error display function (`showError`)
  - Error hiding function (`hideError`)
  - Results hiding function (`hideResults`)
  - Home button reset functionality
  - Form focus styles and animations
  - Alert styling and animations
  - Footer styling
  - Mobile responsiveness

---

## 🔧 Key Functions

### `handleSearch()`
Main entry point that validates input and routes to stock or crypto fetching functions.

### `fetchStockData(symbol)`
Fetches current stock price data from Yahoo Finance API and displays it.

### `fetchCryptoData(symbol)`
Fetches current cryptocurrency price data from CoinGecko API.

### `displayPriceData(name, price, change, changePercent)`
Formats and displays the current price information with color-coded changes.

### `fetchStockHistorical(symbol)` / `fetchCryptoHistorical(symbolId)`
Fetches 7-day historical price data and prepares it for chart display.

### `displayHistoricalData(dates, prices, symbol)`
Creates an interactive Chart.js line graph and populates the historical table.

### `showError(message)` / `hideError()` / `showHistoricalError(message)`
Manages error message display and visibility. `showHistoricalError` displays errors without hiding the current price display.

## 💡 Usage Examples

### Searching for Stocks
1. Select "Stock" from the Asset Type dropdown
2. Enter a stock symbol (e.g., `AAPL`, `MSFT`, `GOOGL`)
3. Click Search or press Enter
4. View current price and 7-day history

### Searching for Cryptocurrencies
1. Select "Cryptocurrency" from the Asset Type dropdown
2. Enter a crypto symbol or name (e.g., `BTC`, `ETH`, `bitcoin`, `ethereum`)
3. Click Search or press Enter
4. View current price and 7-day history

## 🐛 Known Issues & Limitations

- Yahoo Finance API requires a proxy for CORS (uses AllOrigins)
- Some stock symbols may not be available
- Historical data limited to 7 days
- Rate limiting may apply with CoinGecko free tier

## 🔮 Future Improvements

- [ ] Add more time ranges (1 month, 3 months, 1 year)
- [ ] Save favorite stocks/cryptos
- [ ] Price alerts/notifications
- [ ] Portfolio tracking
- [ ] Dark mode toggle
- [ ] Export data functionality

## 📝 License

This project is created for educational purposes as part of a Client Programming course.

## 🙏 Acknowledgments

- **Yahoo Finance** for stock data API
- **CoinGecko** for cryptocurrency data API
- **Chart.js** for beautiful data visualization
- **Bootstrap** for responsive UI components
- **AllOrigins** for CORS proxy service

## 📞 Contact

For questions or issues, please contact any team member or open an issue on [GitHub](https://github.com/pascwey/groupb-stock-crypto-tracker/issues).

## 🔗 Links

- **Live Site**: [https://pascwey.github.io/groupb-stock-crypto-tracker/](https://pascwey.github.io/groupb-stock-crypto-tracker/)
- **Repository**: [https://github.com/pascwey/groupb-stock-crypto-tracker](https://github.com/pascwey/groupb-stock-crypto-tracker)

---

**Group B - Client Programming Project**  
*Built with ❤️ by Agon, Bardhyl, Dea, Erin, and Pascal*
