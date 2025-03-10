"use client";

import { useEffect, useRef, useState } from 'react';
import type { Theme } from '@/providers/ThemeProvider';

interface TradingChartProps {
  symbol: string;
  theme?: Theme;
}

interface TradingViewWidgetConfig {
  autosize?: boolean;
  symbol: string;
  interval?: string;
  timezone?: string;
  theme?: string;
  style?: string;
  locale?: string;
  toolbar_bg?: string;
  enable_publishing?: boolean;
  allow_symbol_change?: boolean;
  container_id: string;
  hide_side_toolbar?: boolean;
  [key: string]: unknown;
}

// TradingView widget için global tipini tanımla
declare global {
  interface Window {
    TradingView: {
      widget: new (config: TradingViewWidgetConfig) => unknown;
    };
  }
}

export default function TradingChart({ symbol, theme = "light" }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    // TradingView widget'ını yükle
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (!isMounted) return;
      
      try {
        if (containerRef.current && window.TradingView) {
          // Önceki widget'ı temizle
          containerRef.current.innerHTML = '';
          
          // Yeni widget oluştur
          new window.TradingView.widget({
            autosize: true,
            symbol: symbol,
            interval: "D",
            timezone: "Etc/UTC",
            theme: theme === 'dark' ? 'dark' : 'light',
            style: "1",
            locale: "tr",
            toolbar_bg: theme === 'dark' ? '#1e1e2d' : '#f1f5f9',
            enable_publishing: false,
            allow_symbol_change: false,
            container_id: containerRef.current.id,
            hide_side_toolbar: false,
          });
          
          setIsLoading(false);
        }
      } catch (err) {
        console.error("TradingView widget yüklenirken hata:", err);
        setError("Grafik yüklenirken bir hata oluştu");
        setIsLoading(false);
      }
    };
    
    script.onerror = () => {
      if (!isMounted) return;
      setError("TradingView widget yüklenemedi");
      setIsLoading(false);
    };
    
    document.head.appendChild(script);

    return () => {
      isMounted = false;
      // Script'i temizle
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol, theme]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4 p-2 bg-slate-100 rounded dark:bg-slate-800">
        <h2 className="text-lg font-semibold text-foreground">{symbol}</h2>
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center flex-grow bg-white dark:bg-slate-900 min-h-[500px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 dark:border-slate-200"></div>
        </div>
      )}
      
      {error && (
        <div className="flex justify-center items-center flex-grow bg-white text-red-500 dark:bg-slate-900 min-h-[500px]">
          {error}
        </div>
      )}
      
      <div 
        id="tradingview_widget" 
        ref={containerRef} 
        className={`w-full flex-grow min-h-[500px] ${isLoading || error ? 'hidden' : 'block'}`} 
      />
    </div>
  );
} 