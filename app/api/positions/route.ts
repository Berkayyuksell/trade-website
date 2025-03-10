import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse("Yetkisiz erişim", { status: 401 });
    }
    
    const body = await request.json();
    const { symbol, entryPrice, amount, leverage, type } = body;
    
    if (!symbol || !entryPrice || !amount || !leverage || !type) {
      return new NextResponse("Eksik bilgi", { status: 400 });
    }
    
    // Kullanıcının bakiyesini kontrol et
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    
    if (!user) {
      return new NextResponse("Kullanıcı bulunamadı", { status: 404 });
    }
    
    const requiredBalance = amount;
    
    if (user.balance < requiredBalance) {
      return new NextResponse("Yetersiz bakiye", { status: 400 });
    }
    
    // Likidite fiyatını hesapla
    const securityMargin = 0.005; // %0.5 güvenlik marjı
    let liquidationPrice = 0;
    
    if (type === "LONG") {
      liquidationPrice = entryPrice * (1 - (1 / leverage) + securityMargin);
    } else {
      liquidationPrice = entryPrice * (1 + (1 / leverage) - securityMargin);
    }
    
    // Pozisyonu oluştur
    const position = await prisma.position.create({
      data: {
        userId: session.user.id,
        symbol,
        entryPrice: parseFloat(entryPrice.toString()),
        amount: parseFloat(amount.toString()),
        leverage: parseInt(leverage.toString()),
        type,
        status: "OPEN",
        liquidationPrice 
      }
    });
    
    // Kullanıcının bakiyesini güncelle
    await prisma.user.update({
      where: { id: session.user.id },
      data: { balance: user.balance - requiredBalance }
    });
    
    return NextResponse.json(position);
  } catch (error) {
    console.log(error, "POSITION_CREATE_ERROR");
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Yetkilendirme hatası" },
        { status: 401 }
      );
    }
    
    // Kullanıcının açık pozisyonlarını getir
    const positions = await prisma.position.findMany({
      where: {
        userId: session.user.id,
        status: "OPEN",
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return NextResponse.json(positions);
  } catch (error) {
    console.error("Pozisyonlar alınırken hata:", error);
    return NextResponse.json(
      { error: "Pozisyonlar alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
} 