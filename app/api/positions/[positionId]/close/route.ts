import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }
    
    // URL'den positionId'yi al
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const positionId = pathParts[pathParts.length - 2]; // [...]/positionId/close
    
    const body = await request.json();
    const { exitPrice, isLiquidation = false } = body;
    
    if (!exitPrice) {
      return NextResponse.json({ error: "Çıkış fiyatı gerekli" }, { status: 400 });
    }
    
    // Pozisyonu bul
    const position = await prisma.position.findUnique({
      where: {
        id: positionId,
        status: "OPEN"
      }
    });
    
    if (!position) {
      return NextResponse.json({ error: "Pozisyon bulunamadı" }, { status: 404 });
    }
    
    // Kullanıcı yetkisini kontrol et (likidite durumu hariç)
    if (!isLiquidation && position.userId !== session.user.id) {
      return NextResponse.json({ error: "Bu pozisyonu kapatma yetkiniz yok" }, { status: 403 });
    }
    
    // Kar/zarar hesapla
    const exitPriceFloat = parseFloat(exitPrice.toString());
    let profit = 0;
    
    if (position.type === "LONG") {
      // LONG pozisyonda, çıkış fiyatı > giriş fiyatı ise kar
      const priceChange = exitPriceFloat - position.entryPrice;
      const percentageChange = priceChange / position.entryPrice;
      profit = position.amount * position.leverage * percentageChange;
    } else {
      // SHORT pozisyonda, giriş fiyatı > çıkış fiyatı ise kar
      const priceChange = position.entryPrice - exitPriceFloat;
      const percentageChange = priceChange / position.entryPrice;
      profit = position.amount * position.leverage * percentageChange;
    }
    
    // Likidite durumunda kar/zarar sıfırlanır ve yatırılan miktar kaybedilir
    if (isLiquidation) {
      profit = -position.amount; // Yatırılan miktar kadar zarar
    }
    
    // Pozisyonu kapat
    const updatedPosition = await prisma.position.update({
      where: { id: positionId },
      data: {
        status: "CLOSED",
        exitPrice: exitPriceFloat,
        profit,
        closedAt: new Date()
      }
    });
    
    // Kullanıcının bakiyesini güncelle (yatırılan miktar + kar/zarar)
    // Likidite durumunda yatırılan miktar geri ödenmez
    if (!isLiquidation) {
      const user = await prisma.user.findUnique({
        where: { id: position.userId }
      });
      
      if (user) {
        await prisma.user.update({
          where: { id: position.userId },
          data: { 
            balance: user.balance + position.amount + profit 
          }
        });
      }
    }
    
    return NextResponse.json({
      ...updatedPosition,
      isLiquidated: isLiquidation
    });
  } catch (error) {
    console.error("POSITION_CLOSE_ERROR:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
} 