"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, CreditCard, Wallet } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  balance: number;
}

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
}

export default function WalletPage() {
  const router = useRouter();
  const { status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchUserData();
      fetchTransactions();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get("/api/user");
      setUserData(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Kullanıcı bilgileri alınamadı:", error);
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get("/api/transactions");
      setTransactions(response.data);
    } catch (error) {
      console.error("İşlem geçmişi alınamadı:", error);
    }
  };

  const handleDeposit = async () => {
    setIsProcessing(true);
    try {
      const response = await axios.post("/api/transactions/deposit", {
        amount: parseFloat(depositAmount) || 100,
      });
      
      console.log("Para yatırma yanıtı:", response.data);
      toast.success("Para yatırma işlemi başarılı");
      setDepositAmount("");
      fetchUserData();
      fetchTransactions();
    } catch (error) {
      console.error("Para yatırma işlemi başarısız:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Sunucu hatası:", error.response.data);
        toast.error(`Hata: ${error.response.data.error || "Para yatırma işlemi sırasında bir hata oluştu"}`);
      } else {
        toast.error("Para yatırma işlemi sırasında bir hata oluştu");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    setIsProcessing(true);
    try {
      const response = await axios.post("/api/transactions/withdraw", {
        amount: parseFloat(withdrawAmount) || 100,
      });
      
      console.log("Para çekme yanıtı:", response.data);
      toast.success("Para çekme işlemi başarılı");
      setWithdrawAmount("");
      fetchUserData();
      fetchTransactions();
    } catch (error) {
      console.error("Para çekme işlemi başarısız:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Sunucu hatası:", error.response.data);
        toast.error(`Hata: ${error.response.data.error || "Para çekme işlemi sırasında bir hata oluştu"}`);
      } else {
        toast.error("Para çekme işlemi sırasında bir hata oluştu");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 dark:border-slate-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-foreground">Cüzdan</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="mr-2 h-5 w-5" />
                  Bakiye
                </CardTitle>
                <CardDescription>
                  Mevcut bakiyeniz ve para yatırma/çekme işlemleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="text-3xl font-bold text-foreground">
                    ${userData?.balance.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Kullanılabilir bakiye
                  </div>
                </div>

                <Tabs defaultValue="deposit" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="deposit">Para Yatır</TabsTrigger>
                    <TabsTrigger value="withdraw">Para Çek</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="deposit" className="mt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="depositAmount">Yatırılacak Miktar ($)</Label>
                        <Input
                          id="depositAmount"
                          type="number"
                          placeholder="0.00"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                        />
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleDeposit}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            İşleniyor...
                          </>
                        ) : (
                          <>
                            <ArrowDownToLine className="mr-2 h-4 w-4" />
                            Para Yatır
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="withdraw" className="mt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="withdrawAmount">Çekilecek Miktar ($)</Label>
                        <Input
                          id="withdrawAmount"
                          type="number"
                          placeholder="0.00"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                        />
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleWithdraw}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            İşleniyor...
                          </>
                        ) : (
                          <>
                            <ArrowUpFromLine className="mr-2 h-4 w-4" />
                            Para Çek
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Ödeme Yöntemleri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Şu anda desteklenen ödeme yöntemleri:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-2">
                      <span className="text-blue-600 dark:text-blue-300 font-bold">V</span>
                    </div>
                    <span>Visa</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-2">
                      <span className="text-red-600 dark:text-red-300 font-bold">M</span>
                    </div>
                    <span>Mastercard</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mr-2">
                      <span className="text-yellow-600 dark:text-yellow-300 font-bold">P</span>
                    </div>
                    <span>PayPal</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 text-foreground">İşlem Geçmişi</h2>
          
          {transactions.length === 0 ? (
            <div className="bg-card p-6 rounded-lg text-center">
              <p className="text-muted-foreground">Henüz işlem geçmişiniz bulunmuyor.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-card rounded-lg">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left">Tarih</th>
                    <th className="py-3 px-4 text-left">İşlem</th>
                    <th className="py-3 px-4 text-left">Miktar</th>
                    <th className="py-3 px-4 text-left">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-secondary/20">
                      <td className="py-3 px-4">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {transaction.type === "DEPOSIT" ? "Para Yatırma" : "Para Çekme"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={transaction.type === "DEPOSIT" ? "text-green-600" : "text-red-600"}>
                          {transaction.type === "DEPOSIT" ? "+" : "-"}${transaction.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Tamamlandı
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 