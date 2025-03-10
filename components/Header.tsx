"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import ThemeToggle from "@/components/ThemeToggle";
import { 
  User, 
  LogOut, 
  Wallet, 
  BarChart3, 
  Settings,
  ChevronDown
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  balance: number;
}

export default function Header() {
  const user = useCurrentUser();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/user");
        setUserData(response.data);
      } catch (error) {
        console.error("Kullanıcı bilgileri alınamadı", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  const userInitials = userData?.name
    ? userData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <BarChart3 className="h-6 w-6 mr-2 text-foreground" />
          <span className="text-xl font-bold text-foreground">Trade Platform</span>
        </Link>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {!isLoading && userData && (
            <>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Bakiye:</span>{" "}
                  <span className="font-semibold text-foreground">${userData.balance.toFixed(2)}</span>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 text-foreground">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline-block">{userData.name}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-background border-border shadow-lg">
                    <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
                    <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                      {userData.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/account")} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/account/wallet")} className="cursor-pointer">
                      <Wallet className="mr-2 h-4 w-4" />
                      <span>Cüzdan</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/account/settings")} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Ayarlar</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Çıkış Yap</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Mobil görünüm için */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Hesabım</SheetTitle>
                      <SheetDescription>
                        {userData.email}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4">
                      <div className="mb-4 p-3 bg-secondary rounded-md">
                        <div className="text-sm text-muted-foreground">Bakiye</div>
                        <div className="text-2xl font-bold">${userData.balance.toFixed(2)}</div>
                      </div>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start" 
                          onClick={() => router.push("/account")}
                        >
                          <User className="mr-2 h-4 w-4" />
                          <span>Profil</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start" 
                          onClick={() => router.push("/account/wallet")}
                        >
                          <Wallet className="mr-2 h-4 w-4" />
                          <span>Cüzdan</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start" 
                          onClick={() => router.push("/account/settings")}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Ayarlar</span>
                        </Button>
                        <Button 
                          variant="destructive" 
                          className="w-full justify-start" 
                          onClick={handleSignOut}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Çıkış Yap</span>
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
} 