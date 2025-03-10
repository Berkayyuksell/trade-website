import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
      // İşlemi oluştur ve bakiyeyi güncelle
      const result = await prisma.$transaction(async (tx) => {
        // İşlemi oluştur
        const newTransaction = await tx.transaction.create({
          data: {
            userId: user.id,
            amount: amountValue,
            type: "WITHDRAW",
            status: "COMPLETED",
          },
        });
        
        // Kullanıcı bakiyesini güncelle
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: { balance: user.balance - amountValue },
        });
        
        return { newTransaction, updatedUser };
      });
      
      return NextResponse.json(
        { message: "Para çekme işlemi başarılı", transaction: result.newTransaction },
        { status: 200 }
      );
    } catch (txError) {
      console.error("Transaction hatası:", txError);
      return NextResponse.json(
        { error: "İşlem sırasında bir hata oluştu" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Para çekme işlemi hatası:", error);
    return NextResponse.json(
      { error: "Para çekme işlemi sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
} 