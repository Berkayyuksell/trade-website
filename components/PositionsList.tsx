"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { getCryptoPrices } from "@/lib/crypto-api";
import { AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Position {
  id: string;
  symbol: string;
  entryPrice: number;
  amount: number;
  leverage: number;
  type: string;
  status: string;
  liquidationPrice: number;
  createdAt: string;
}

export default function PositionsList() {
  const router = useRouter();
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);

  const fetchPositions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/positions");
      setPositions(response.data);
    } catch (error) {
      console.error("Pozisyonlar alınamadı", error);
      setError("Pozisyonlar yüklenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCryptoPrices = async () => {
    try {
      setIsUpdatingPrices(true);
      const prices = await getCryptoPrices();
      
      // API'den gelen fiyatları formatlayarak state'e kaydet
      const formattedPrices: Record<string, number> = {};
      Object.entries(prices).forEach(([symbol, data]) => {
        formattedPrices[symbol] = data.price;
      });
      
      setCurrentPrices(formattedPrices);
      
      // Likidite kontrolü
      checkLiquidations(formattedPrices);
    } catch (error) {
      console.error("Kripto fiyatları alınamadı", error);
    } finally {
      setIsUpdatingPrices(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    fetchCryptoPrices();
    
    // 10 saniyede bir fiyatları güncelle
    const interval = setInterval(fetchCryptoPrices, 10000);
    
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Likidite kontrolü
  const checkLiquidations = async (prices: Record<string, number>) => {
    const positionsToLiquidate = positions.filter(position => {
      const currentPrice = prices[position.symbol] || 0;
      if (currentPrice === 0) return false;
      
      if (position.type === "LONG") {
        return currentPrice <= position.liquidationPrice;
      } else {
        return currentPrice >= position.liquidationPrice;
      }
    });
    
    // Likidite olan pozisyonları kapat
    for (const position of positionsToLiquidate) {
      try {
        const currentPrice = prices[position.symbol] || 0;
        await axios.post(`/api/positions/${position.id}/close`, {
          exitPrice: currentPrice,
          isLiquidation: true
        });
        console.log(`Pozisyon likit oldu: ${position.id}`);
      } catch (error) {
        console.error(`Pozisyon likidite hatası: ${position.id}`, error);
      }
    }
    
    // Pozisyonları yeniden yükle
    if (positionsToLiquidate.length > 0) {
      fetchPositions();
    }
  };

  const closePosition = async (positionId: string, symbol: string) => {
    try {
      const currentPrice = currentPrices[symbol] || 0;
      
      if (currentPrice === 0) {
        alert("Güncel fiyat bilgisi alınamadı. Lütfen daha sonra tekrar deneyin.");
        return;
      }
      
      await axios.post(`/api/positions/${positionId}/close`, {
        exitPrice: currentPrice
      });
      
      fetchPositions();
      router.refresh();
    } catch (error) {
      console.error("Pozisyon kapatılamadı", error);
    }
  };

  const calculatePnL = (position: Position) => {
    const currentPrice = currentPrices[position.symbol] || position.entryPrice;
    let pnl = 0;
    
    if (position.type === "LONG") {
      // LONG pozisyonlar için: (Mevcut fiyat - Giriş fiyatı) / Giriş fiyatı * Yatırılan miktar * Kaldıraç
      const priceChange = currentPrice - position.entryPrice;
      const percentageChange = priceChange / position.entryPrice;
      pnl = position.amount * position.leverage * percentageChange;
    } else {
      // SHORT pozisyonlar için: (Giriş fiyatı - Mevcut fiyat) / Giriş fiyatı * Yatırılan miktar * Kaldıraç
      const priceChange = position.entryPrice - currentPrice;
      const percentageChange = priceChange / position.entryPrice;
      pnl = position.amount * position.leverage * percentageChange;
    }
    
    return pnl;
  };
  
  // Likidite fiyatına olan mesafe (yüzde olarak)
  const calculateLiquidationDistance = (position: Position) => {
    const currentPrice = currentPrices[position.symbol] || position.entryPrice;
    
    if (position.type === "LONG") {
      return ((currentPrice - position.liquidationPrice) / currentPrice) * 100;
    } else {
      return ((position.liquidationPrice - currentPrice) / currentPrice) * 100;
    }
  };

  if (isLoading) {
    return <div className="text-center py-4 text-foreground">Pozisyonlar yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">{error}</div>;
  }

  if (positions.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">Açık pozisyon bulunmuyor</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">Açık Pozisyonlar</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchCryptoPrices}
          disabled={isUpdatingPrices}
          className="text-foreground"
        >
          {isUpdatingPrices ? "Güncelleniyor..." : "Fiyatları Güncelle"}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {positions.map((position) => {
          const pnl = calculatePnL(position);
          const isProfitable = pnl > 0;
          const currentPrice = currentPrices[position.symbol] || 0;
          const priceChange = currentPrice > 0 ? 
            ((currentPrice - position.entryPrice) / position.entryPrice * 100) : 0;
          const liquidationDistance = calculateLiquidationDistance(position);
          
          // Likidite riski
          const isHighRisk = liquidationDistance < 5; // %5'ten az kaldıysa yüksek risk
          
          return (
            <Card key={position.id} className="overflow-hidden bg-card">
              <CardHeader className={`py-3 ${
                position.type === "LONG" 
                  ? "bg-green-50 dark:bg-green-900/20" 
                  : "bg-red-50 dark:bg-red-900/20"
              }`}>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base text-foreground">
                    {position.symbol} {position.type}
                  </CardTitle>
                  <span className="text-sm font-medium text-foreground">
                    {position.leverage}x Kaldıraç
                  </span>
                </div>
              </CardHeader>
              <CardContent className="py-3">
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <div className="text-muted-foreground">Giriş Fiyatı</div>
                    <div className="font-medium text-foreground">${position.entryPrice.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Güncel Fiyat</div>
                    <div className="font-medium text-foreground">
                      {currentPrice > 0 ? 
                        `$${currentPrice.toLocaleString()}` : 
                        "Yükleniyor..."}
                    </div>
                    {currentPrice > 0 && (
                      <div className={`text-xs ${isProfitable ? "text-green-600" : "text-red-600"}`}>
                        {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-muted-foreground">Miktar</div>
                    <div className="font-medium text-foreground">${position.amount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Kar/Zarar</div>
                    <div className={`font-medium ${isProfitable ? "text-green-600" : "text-red-600"}`}>
                      {isProfitable ? "+" : ""}{pnl.toFixed(2)} USD
                    </div>
                  </div>
                </div>
                
                <div className={`p-2 rounded mb-3 flex items-center justify-between ${
                  isHighRisk ? "bg-red-100 dark:bg-red-900/20" : "bg-secondary/50"
                }`}>
                  <div className="flex items-center">
                    <AlertTriangle className={`h-4 w-4 mr-2 ${isHighRisk ? "text-red-600" : "text-amber-500"}`} />
                    <span className="text-sm text-foreground">Likidite Fiyatı:</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm font-medium text-foreground">
                          ${position.liquidationPrice.toFixed(2)} ({liquidationDistance.toFixed(2)}%)
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          {position.type === "LONG" 
                            ? "Fiyat bu seviyeye düşerse, pozisyonunuz otomatik olarak kapatılır." 
                            : "Fiyat bu seviyeye yükselirse, pozisyonunuz otomatik olarak kapatılır."}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => closePosition(position.id, position.symbol)}
                  disabled={currentPrice === 0}
                >
                  Pozisyonu Kapat
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 