"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AlertTriangle, Wallet } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LeverageTradeFormProps {
  symbol: string;
  currentPrice: number;
  onPositionCreated: () => void;
}

interface UserData {
  id: string;
  name: string | null;
  email: string;
  balance: number;
}

export default function LeverageTradeForm({
  symbol,
  currentPrice,
  onPositionCreated,
}: LeverageTradeFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState<string>("100");
  const [leverage, setLeverage] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [amountPercentage, setAmountPercentage] = useState<number[]>([25]);

  // Kullanıcı bilgilerini al
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/user");
        setUserData(response.data);
      } catch (error) {
        console.error("Kullanıcı bilgileri alınamadı:", error);
      }
    };

    fetchUserData();
  }, []);

  // Başarı mesajını 3 saniye sonra temizle
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Slider değeri değiştiğinde amount'u güncelle
  useEffect(() => {
    if (userData) {
      const calculatedAmount = (userData.balance * amountPercentage[0] / 100).toFixed(2);
      setAmount(calculatedAmount);
    }
  }, [amountPercentage, userData]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      
      // Manuel değer girildiğinde slider'ı da güncelle
      if (userData && parseFloat(value) > 0) {
        const percentage = Math.min(Math.round((parseFloat(value) / userData.balance) * 100), 100);
        setAmountPercentage([percentage || 1]);
      }
    }
  };

  const handleLeverageChange = (value: number[]) => {
    setLeverage(value[0]);
  };

  const handleAmountPercentageChange = (value: number[]) => {
    setAmountPercentage(value);
  };

  const createPosition = async (type: "LONG" | "SHORT") => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Lütfen geçerli bir miktar girin");
      return;
    }

    if (currentPrice <= 0) {
      setError("Güncel fiyat bilgisi alınamadı. Lütfen daha sonra tekrar deneyin.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await axios.post("/api/positions", {
        symbol,
        entryPrice: currentPrice,
        amount: parseFloat(amount),
        leverage,
        type,
      });

      setSuccessMessage(`${symbol} ${type} pozisyonu başarıyla açıldı!`);
      onPositionCreated();
      router.refresh();
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.error || "İşlem oluşturulurken bir hata oluştu");
      } else {
        setError("İşlem oluşturulurken bir hata oluştu");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Hesaplamalar
  const amountValue = parseFloat(amount || "0");
  
  // İşlem hacmi hesaplama
  const tradeVolume = amountValue * leverage;
  
  // Likidite seviyesi hesaplama
  const calculateLiquidationPrice = (type: "LONG" | "SHORT") => {
    // Kaldıraç işlemlerinde likidite seviyesi genellikle şu şekilde hesaplanır:
    // LONG pozisyonlar için: entryPrice * (1 - 1/leverage) - küçük bir güvenlik marjı
    // SHORT pozisyonlar için: entryPrice * (1 + 1/leverage) + küçük bir güvenlik marjı
    
    const securityMargin = 0.005; // %0.5 güvenlik marjı
    
    if (type === "LONG") {
      return currentPrice * (1 - (1 / leverage) + securityMargin);
    } else {
      return currentPrice * (1 + (1 / leverage) - securityMargin);
    }
  };
  
  const longLiquidationPrice = calculateLiquidationPrice("LONG");
  const shortLiquidationPrice = calculateLiquidationPrice("SHORT");
  
  // Likidite fiyatına olan mesafe (yüzde olarak)
  const calculateLiquidationDistance = (type: "LONG" | "SHORT") => {
    if (type === "LONG") {
      return ((currentPrice - longLiquidationPrice) / currentPrice) * 100;
    } else {
      return ((shortLiquidationPrice - currentPrice) / currentPrice) * 100;
    }
  };
  
  const longLiquidationDistance = calculateLiquidationDistance("LONG");
  const shortLiquidationDistance = calculateLiquidationDistance("SHORT");

  return (
    <Card className="bg-card text-card-foreground h-full flex flex-col">
      <CardHeader>
        <CardTitle>İşlem Oluştur</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4 h-full flex flex-col">
          {error && (
            <div className="p-3 text-sm text-white bg-red-500 rounded">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 text-sm text-white bg-green-500 rounded">
              {successMessage}
            </div>
          )}

          {userData && (
            <div className="flex items-center justify-between mb-2 text-sm">
              <div className="flex items-center">
                <Wallet className="h-4 w-4 mr-1" />
                <span>Cüzdan Bakiyesi:</span>
              </div>
              <span className="font-medium">${userData.balance.toFixed(2)}</span>
            </div>
          )}

          <div className="space-y-4">
            {userData && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-foreground">Cüzdanınızın Yüzdesi</label>
                  <span className="text-sm font-medium">%{amountPercentage[0]}</span>
                </div>
                <Slider
                  value={amountPercentage}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={handleAmountPercentageChange}
                  disabled={isLoading}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>%1</span>
                  <span>%25</span>
                  <span>%50</span>
                  <span>%75</span>
                  <span>%100</span>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Miktar (USD)</label>
              <Input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                disabled={isLoading}
                className="bg-background text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-foreground">Kaldıraç: {leverage}x</label>
              <span className="text-sm text-muted-foreground">Max: 20x</span>
            </div>
            <Slider
              value={[leverage]}
              min={1}
              max={20}
              step={1}
              onValueChange={handleLeverageChange}
              disabled={isLoading}
            />
          </div>

          <div className="p-3 bg-secondary rounded space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-foreground">Giriş Fiyatı:</span>
              <span className="font-medium text-foreground">
                {currentPrice > 0 ? `$${currentPrice.toLocaleString()}` : "Yükleniyor..."}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-foreground">Hacim:</span>
              <span className="font-medium text-foreground">${tradeVolume.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-foreground">Likidite Fiyatı:</span>
              <span className="font-medium text-amber-500">${longLiquidationPrice.toFixed(2)}</span>
            </div>
          </div>

          <Tabs defaultValue="long">
            <TabsList className="grid w-full grid-cols-2 p-0 bg-secondary/50">
              <TabsTrigger 
                value="long" 
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-none py-2"
              >
                LONG
              </TabsTrigger>
              <TabsTrigger 
                value="short" 
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-none py-2"
              >
                SHORT
              </TabsTrigger>
            </TabsList>
            <TabsContent value="long" className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                LONG pozisyonu, fiyatın yükseleceğini düşündüğünüzde açılır.
              </p>
              
              <div className="p-3 bg-secondary/50 rounded flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                  <span className="text-sm text-foreground">Likidite Fiyatı:</span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-sm font-medium text-foreground">
                        ${longLiquidationPrice.toFixed(2)} ({longLiquidationDistance.toFixed(2)}%)
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        Fiyat bu seviyeye düşerse, pozisyonunuz otomatik olarak kapatılır ve yatırımınızı kaybedersiniz.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => createPosition("LONG")}
                disabled={isLoading || currentPrice <= 0}
              >
                {isLoading ? "İşleniyor..." : "LONG Pozisyon Aç"}
              </Button>
            </TabsContent>
            <TabsContent value="short" className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                SHORT pozisyonu, fiyatın düşeceğini düşündüğünüzde açılır.
              </p>
              
              <div className="p-3 bg-secondary/50 rounded flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                  <span className="text-sm text-foreground">Likidite Fiyatı:</span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-sm font-medium text-foreground">
                        ${shortLiquidationPrice.toFixed(2)} ({shortLiquidationDistance.toFixed(2)}%)
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        Fiyat bu seviyeye yükselirse, pozisyonunuz otomatik olarak kapatılır ve yatırımınızı kaybedersiniz.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={() => createPosition("SHORT")}
                disabled={isLoading || currentPrice <= 0}
              >
                {isLoading ? "İşleniyor..." : "SHORT Pozisyon Aç"}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
} 