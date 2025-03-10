import axios from 'axios';

// Binance API'sinden gelen ticker verisi için tip tanımı
interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  [key: string]: unknown;
}

// Binance API'sinden gelen kline verisi için tip tanımı
type BinanceKline = [
  number, // Open time
  string, // Open
  string, // High
  string, // Low
  string, // Close
  string, // Volume
  number, // Close time
  string, // Quote asset volume
  number, // Number of trades
  string, // Taker buy base asset volume
  string, // Taker buy quote asset volume
  string  // Ignore
];

// Kripto para birimlerinin Binance sembolleri
const BINANCE_SYMBOLS: Record<string, string> = {
  'BTC/USD': 'BTCUSDT',
  'ETH/USD': 'ETHUSDT',
  'SOL/USD': 'SOLUSDT',
  'BNB/USD': 'BNBUSDT',
  'XRP/USD': 'XRPUSDT',
  'ADA/USD': 'ADAUSDT',
  'DOGE/USD': 'DOGEUSDT',
  'DOT/USD': 'DOTUSDT',
  'AVAX/USD': 'AVAXUSDT',
  'MATIC/USD': 'MATICUSDT',
};

// Kripto para fiyatlarını al
export async function getCryptoPrices(): Promise<Record<string, { price: number, change24h: number }>> {
  try {
    // Binance API'sinden 24 saatlik fiyat değişimlerini al
    const response = await axios.get<BinanceTicker[]>('https://api.binance.com/api/v3/ticker/24hr');
    
    // API yanıtını formatlayarak döndür
    const prices: Record<string, { price: number, change24h: number }> = {};
    
    // Binance'den gelen verileri işle
    response.data.forEach((ticker: BinanceTicker) => {
      // Binance sembolünü bizim formatımıza çevir
      const ourSymbol = Object.entries(BINANCE_SYMBOLS).find(
        ([, binanceSymbol]) => binanceSymbol === ticker.symbol
      );
      
      if (ourSymbol) {
        prices[ourSymbol[0]] = {
          price: parseFloat(ticker.lastPrice),
          change24h: parseFloat(ticker.priceChangePercent),
        };
      }
    });
    
    return prices;
  } catch (error) {
    console.error("Kripto fiyatları alınamadı:", error);
    
    // API hatası durumunda yedek olarak sabit fiyatlar kullan
    return getFallbackPrices();
  }
}

// Belirli bir kripto para biriminin fiyatını Binance API'sinden al
export async function getCryptoPrice(symbol: string): Promise<{ price: number, change24h: number } | null> {
  try {
    const binanceSymbol = BINANCE_SYMBOLS[symbol];
    if (!binanceSymbol) return null;
    
    // Binance API'sinden belirli bir sembolün 24 saatlik verilerini al
    const response = await axios.get<BinanceTicker>(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`);
    
    if (response.data) {
      return {
        price: parseFloat(response.data.lastPrice),
        change24h: parseFloat(response.data.priceChangePercent),
      };
    }
    
    return null;
  } catch (error) {
    console.error(`${symbol} fiyatı alınamadı:`, error);
    
    // API hatası durumunda yedek olarak sabit fiyat kullan
    const fallbackPrices = getFallbackPrices();
    return fallbackPrices[symbol] || null;
  }
}

// Kripto para biriminin geçmiş verilerini Binance API'sinden al
export async function getCryptoHistoricalData(symbol: string, interval = '1d'): Promise<Array<{ time: number, open: number, high: number, low: number, close: number }>> {
  try {
    const binanceSymbol = BINANCE_SYMBOLS[symbol];
    if (!binanceSymbol) return [];
    
    // Binance API'sinden K-line (mum) verileri al
    // interval: 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M
    const response = await axios.get<BinanceKline[]>(
      `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=100`
    );
    
    // OHLC formatına dönüştür
    if (response.data && Array.isArray(response.data)) {
      return response.data.map((kline: BinanceKline) => ({
        time: kline[0] / 1000, // Unix timestamp (ms -> s)
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
      }));
    }
    
    return [];
  } catch (error) {
    console.error(`${symbol} geçmiş verileri alınamadı:`, error);
    
    // API hatası durumunda yedek olarak rastgele veriler oluştur
    return getFallbackHistoricalData(symbol);
  }
}

// API hatası durumunda kullanılacak yedek fiyatlar
function getFallbackPrices(): Record<string, { price: number, change24h: number }> {
  const prices: Record<string, { price: number, change24h: number }> = {};
  
  getAvailableSymbols().forEach((symbol) => {
    const basePrice = getBasePrice(symbol);
    const randomChange = (Math.random() * 0.1) - 0.05; // -5% ile +5% arası değişim
    
    prices[symbol] = {
      price: basePrice * (1 + randomChange),
      change24h: randomChange * 100,
    };
  });
  
  return prices;
}

// API hatası durumunda kullanılacak yedek geçmiş veriler
function getFallbackHistoricalData(symbol: string): Array<{ time: number, open: number, high: number, low: number, close: number }> {
  const data = [];
  const basePrice = getBasePrice(symbol);
  let currentPrice = basePrice;
  
  // Son 30 günlük veri oluştur
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    
    // Rastgele fiyat değişimi
    const changePercent = (Math.random() * 0.1) - 0.05; // -5% ile +5% arası
    currentPrice = currentPrice * (1 + changePercent);
    
    // OHLC verileri
    const open = currentPrice;
    const close = currentPrice * (1 + (Math.random() * 0.02) - 0.01);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    
    data.push({
      time: date.getTime() / 1000,
      open,
      high,
      low,
      close
    });
  }
  
  return data;
}

// Temel fiyat değerleri (yedek olarak kullanılacak)
function getBasePrice(symbol: string): number {
  const basePrices: Record<string, number> = {
    "BTC/USD": 65000,
    "ETH/USD": 3500,
    "SOL/USD": 150,
    "BNB/USD": 600,
    "XRP/USD": 0.5,
    "ADA/USD": 0.4,
    "DOGE/USD": 0.15,
    "DOT/USD": 7,
    "AVAX/USD": 35,
    "MATIC/USD": 0.8,
  };
  
  return basePrices[symbol] || 100;
}

// Tüm mevcut kripto para birimlerini getir
export function getAvailableSymbols(): string[] {
  return Object.keys(BINANCE_SYMBOLS);
} 