"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import TradingChart from "@/components/TradingChart";
import LeverageTradeForm from "@/components/LeverageTradeForm";
import PositionsList from "@/components/PositionsList";
import { getCryptoPrice, getAvailableSymbols } from "@/lib/crypto-api";
import { useTheme } from "@/providers/ThemeProvider";

// Kullanılabilir kripto para birimleri
const POPULAR_SYMBOLS = ["BTC/USD", "ETH/USD", "SOL/USD", "BNB/USD", "XRP/USD"];
const ALL_SYMBOLS = getAvailableSymbols();

export default function Home() {
  const [selectedSymbol, setSelectedSymbol] = useState(POPULAR_SYMBOLS[0]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [refreshPositions, setRefreshPositions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllSymbols, setShowAllSymbols] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    // Seçilen kripto para biriminin fiyatını çek
    const fetchPrice = async () => {
      try {
        const data = await getCryptoPrice(selectedSymbol);
        
        if (!isMounted) return;
        
        if (data) {
          setCurrentPrice(data.price);
          setPriceChange(data.change24h);
        }
      } catch (error) {
        console.error("Fiyat çekilirken hata:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchPrice();

    // 10 saniyede bir fiyatları güncelle
    const interval = setInterval(fetchPrice, 10000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedSymbol]);

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  const handlePositionCreated = () => {
    setRefreshPositions(prev => prev + 1);
  };

  // Fiyat değişiminin rengini belirle
  const priceChangeColor = priceChange >= 0 ? "text-green-600" : "text-red-600";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Kaldıraçlı İşlemler</h1>
            <button 
              onClick={() => setShowAllSymbols(!showAllSymbols)}
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              {showAllSymbols ? "Popüler Coinleri Göster" : "Tüm Coinleri Göster"}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {(showAllSymbols ? ALL_SYMBOLS : POPULAR_SYMBOLS).map((symbol) => (
              <button
                key={symbol}
                onClick={() => handleSymbolChange(symbol)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedSymbol === symbol
                    ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                    : "bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col">
            <TradingChart symbol={selectedSymbol} theme={theme} />
          </div>
          
          <div className="flex flex-col">
            <div className="mb-6 p-4 bg-white rounded-lg shadow-sm dark:bg-card">
              <div className="mb-2 text-sm text-muted-foreground">Güncel Fiyat</div>
              {isLoading ? (
                <div className="h-8 w-32 bg-slate-200 animate-pulse rounded dark:bg-slate-700"></div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-foreground">${currentPrice.toLocaleString()}</div>
                  <div className={`text-sm font-medium ${priceChangeColor}`}>
                    {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}% (24s)
                  </div>
                </>
              )}
            </div>
            
            <LeverageTradeForm
              symbol={selectedSymbol}
              currentPrice={currentPrice}
              onPositionCreated={handlePositionCreated}
            />
          </div>
        </div>
        
        <div className="mt-8">
          <PositionsList key={refreshPositions} />
        </div>
      </main>
    </div>
  );
}
