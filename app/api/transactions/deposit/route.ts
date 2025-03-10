import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Yetkilendirme hatası" },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { amount } = body;
    const amountValue = parseFloat(amount) || 100;
    
    // Kullanıcı bilgilerini al
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }
    
    try {
      // İşlemi oluştur
      const newTransaction = await prisma.transaction.create({
        data: {
          userId: user.id,
          amount: amountValue,
          type: "DEPOSIT",
          status: "COMPLETED",
        },
      });
      
      // Kullanıcı bakiyesini güncelle
      await prisma.user.update({
        where: { id: user.id },
        data: { balance: user.balance + amountValue },
      });
      
      return NextResponse.json(
        { message: "Para yatırma işlemi başarılı", transaction: newTransaction },
        { status: 200 }
      );
    } catch (txError) {
      console.error("İşlem hatası:", txError);
      return NextResponse.json(
        { error: "İşlem sırasında bir hata oluştu" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Para yatırma işlemi hatası:", error);
    return NextResponse.json(
      { error: "Para yatırma işlemi sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
} 