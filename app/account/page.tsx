"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, ArrowUpRight, ArrowDownRight, BarChart3 } from "lucide-react";
import Header from "@/components/Header";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

interface Position {
  id: string;
  symbol: string;
  entryPrice: number;
  exitPrice: number | null;
  amount: number;
  leverage: number;
  type: string;
  status: string;
  profit: number | null;
  createdAt: string;
  closedAt: string | null;
}

export default function AccountPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [closedPositions, setClosedPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Kullanıcı bilgilerini al
        const userResponse = await axios.get("/api/user");
        setUserData(userResponse.data);
        
        // Açık pozisyonları al
        const openPositionsResponse = await axios.get("/api/positions");
        setPositions(openPositionsResponse.data);
        
        // Kapalı pozisyonları al
        const closedPositionsResponse = await axios.get("/api/positions/closed");
        setClosedPositions(closedPositionsResponse.data || []);
      } catch (error) {
        console.error("Hesap bilgileri alınamadı", error);
        setError("Hesap bilgileri yüklenirken bir hata oluştu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  // Toplam kar/zarar hesapla
  const calculateTotalPnL = () => {
    return closedPositions.reduce((total, position) => {
      return total + (position.profit || 0);
    }, 0);
  };

  // Başarılı işlem sayısı
  const successfulTrades = closedPositions.filter(p => (p.profit || 0) > 0).length;
  
  // Başarı oranı
  const successRate = closedPositions.length > 0 
    ? (successfulTrades / closedPositions.length) * 100 
    : 0;

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-foreground">Hesap Bilgileri</h1>
        
        {userData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Wallet className="mr-2 h-5 w-5" />
                  Bakiye
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${userData.balance.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Kullanılabilir bakiye
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Toplam Kar/Zarar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${calculateTotalPnL() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculateTotalPnL() >= 0 ? '+' : ''}{calculateTotalPnL().toFixed(2)} USD
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Tüm zamanlar
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">İşlem İstatistikleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Toplam İşlem</div>
                    <div className="text-xl font-bold">{closedPositions.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Başarı Oranı</div>
                    <div className="text-xl font-bold">{successRate.toFixed(1)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <Tabs defaultValue="open" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="open">Açık Pozisyonlar ({positions.length})</TabsTrigger>
            <TabsTrigger value="closed">Kapalı Pozisyonlar ({closedPositions.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="open">
            {positions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Açık pozisyon bulunmuyor
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Sembol</th>
                      <th className="text-left py-3 px-4">Tür</th>
                      <th className="text-left py-3 px-4">Giriş Fiyatı</th>
                      <th className="text-left py-3 px-4">Miktar</th>
                      <th className="text-left py-3 px-4">Kaldıraç</th>
                      <th className="text-left py-3 px-4">Tarih</th>
                      <th className="text-left py-3 px-4">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((position) => (
                      <tr key={position.id} className="border-b hover:bg-secondary/20">
                        <td className="py-3 px-4">{position.symbol}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            position.type === "LONG" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          } dark:bg-opacity-20`}>
                            {position.type}
                          </span>
                        </td>
                        <td className="py-3 px-4">${position.entryPrice.toLocaleString()}</td>
                        <td className="py-3 px-4">${position.amount.toLocaleString()}</td>
                        <td className="py-3 px-4">{position.leverage}x</td>
                        <td className="py-3 px-4">{new Date(position.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push("/")}
                          >
                            Görüntüle
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="closed">
            {closedPositions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Kapalı pozisyon bulunmuyor
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Sembol</th>
                      <th className="text-left py-3 px-4">Tür</th>
                      <th className="text-left py-3 px-4">Giriş/Çıkış</th>
                      <th className="text-left py-3 px-4">Miktar</th>
                      <th className="text-left py-3 px-4">Kaldıraç</th>
                      <th className="text-left py-3 px-4">Kar/Zarar</th>
                      <th className="text-left py-3 px-4">Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closedPositions.map((position) => (
                      <tr key={position.id} className="border-b hover:bg-secondary/20">
                        <td className="py-3 px-4">{position.symbol}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            position.type === "LONG" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          } dark:bg-opacity-20`}>
                            {position.type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            ${position.entryPrice.toLocaleString()}
                          </div>
                          <div className="flex items-center mt-1">
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                            ${position.exitPrice?.toLocaleString() || "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4">${position.amount.toLocaleString()}</td>
                        <td className="py-3 px-4">{position.leverage}x</td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${(position.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(position.profit || 0) >= 0 ? '+' : ''}{position.profit?.toFixed(2) || 0} USD
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div>{new Date(position.createdAt).toLocaleDateString()}</div>
                          {position.closedAt && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Kapatıldı: {new Date(position.closedAt).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 