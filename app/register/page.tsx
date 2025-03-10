"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import axios from "axios";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!name || !email || !password || !confirmPassword) {
      setError("Tüm alanları doldurun");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });
      
      if (response.status === 201) {
        // Başarılı kayıt sonrası 2 saniye bekleyip giriş sayfasına yönlendir
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.error || "Kayıt sırasında bir hata oluştu");
      } else {
        setError("Kayıt sırasında bir hata oluştu");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Kayıt Ol</CardTitle>
          <CardDescription className="text-center">
            Trading platformuna kayıt olun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-white bg-red-500 rounded">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Input
                id="name"
                type="text"
                placeholder="Ad Soyad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Şifreyi Tekrar Girin"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-center">
            Zaten hesabınız var mı?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Giriş Yap
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 