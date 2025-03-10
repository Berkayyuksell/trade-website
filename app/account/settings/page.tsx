"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Shield, Key } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Kullanıcı bilgilerini al
        const userResponse = await axios.get("/api/user");
        // Kullanıcı bilgilerini state'e kaydet
        setName(userResponse.data.name || "");
        setEmail(userResponse.data.email || "");
      } catch (error) {
        console.error("Kullanıcı bilgileri alınamadı", error);
        toast.error("Kullanıcı bilgileri yüklenirken bir hata oluştu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session, router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await axios.put("/api/user", {
        name,
        email,
      });
      
      toast.success("Profil bilgileri güncellendi");
    } catch (error) {
      console.error("Profil güncelleme hatası:", error);
      toast.error("Profil güncellenirken bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Tüm alanları doldurun");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Yeni şifreler eşleşmiyor");
      return;
    }
    
    setIsSaving(true);
    
    try {
      await axios.post("/api/user/password", {
        currentPassword,
        newPassword,
      });
      
      toast.success("Şifreniz başarıyla güncellendi");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.error || "Şifre güncellenirken bir hata oluştu");
      } else {
        toast.error("Şifre güncellenirken bir hata oluştu");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setIsSaving(true);
    
    try {
      await axios.put("/api/user/notifications", {
        emailNotifications,
        marketingEmails,
      });
      
      toast.success("Bildirim tercihleri güncellendi");
    } catch (error: unknown) {
      console.error("Bildirim güncelleme hatası:", error);
      toast.error("Bildirim tercihleri güncellenirken bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSecurityUpdate = async () => {
    setIsSaving(true);
    
    try {
      await axios.put("/api/user/security", {
        twoFactorAuth,
      });
      
      toast.success("Güvenlik ayarları güncellendi");
    } catch (error) {
      console.error("Güvenlik ayarları güncelleme hatası:", error);
      toast.error("Güvenlik ayarları güncellenirken bir hata oluştu");
    } finally {
      setIsSaving(false);
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
        <h1 className="text-2xl font-bold mb-6 text-foreground">Hesap Ayarları</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center">
              <Key className="mr-2 h-4 w-4" />
              Şifre
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              Bildirimler
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              Güvenlik
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profil Bilgileri</CardTitle>
                <CardDescription>
                  Kişisel bilgilerinizi güncelleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ad Soyad</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ad Soyad"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="E-posta adresiniz"
                    />
                  </div>
                  
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Şifre Değiştir</CardTitle>
                <CardDescription>
                  Hesap güvenliğiniz için şifrenizi düzenli olarak değiştirin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Mevcut şifreniz"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Yeni Şifre</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Yeni şifreniz"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Yeni şifrenizi tekrar girin"
                    />
                  </div>
                  
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Kaydediliyor..." : "Şifreyi Değiştir"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Bildirim Ayarları</CardTitle>
                <CardDescription>
                  Hangi bildirimler almak istediğinizi seçin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">E-posta Bildirimleri</h3>
                      <p className="text-sm text-muted-foreground">
                        İşlemleriniz ve hesap aktiviteleriniz hakkında e-posta bildirimleri alın
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Pazarlama E-postaları</h3>
                      <p className="text-sm text-muted-foreground">
                        Yeni özellikler, promosyonlar ve teklifler hakkında e-postalar alın
                      </p>
                    </div>
                    <Switch
                      checked={marketingEmails}
                      onCheckedChange={setMarketingEmails}
                    />
                  </div>
                  
                  <Button onClick={handleNotificationUpdate} disabled={isSaving}>
                    {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Güvenlik Ayarları</CardTitle>
                <CardDescription>
                  Hesabınızın güvenliğini artırmak için ayarları yapılandırın
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">İki Faktörlü Kimlik Doğrulama</h3>
                      <p className="text-sm text-muted-foreground">
                        Hesabınıza giriş yaparken ek bir güvenlik katmanı ekleyin
                      </p>
                    </div>
                    <Switch
                      checked={twoFactorAuth}
                      onCheckedChange={setTwoFactorAuth}
                    />
                  </div>
                  
                  <Button onClick={handleSecurityUpdate} disabled={isSaving}>
                    {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 