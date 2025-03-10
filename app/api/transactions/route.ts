import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Yetkilendirme hatası" },
        { status: 401 }
      );
    }
    
    try {
      // Kullanıcının işlem geçmişini getir
      const transactions = await prisma.$queryRaw`
        SELECT * FROM "Transaction"
        WHERE "userId" = ${session.user.id}
        ORDER BY "createdAt" DESC
      `;
      
      return NextResponse.json(transactions, { status: 200 });
    } catch (dbError) {
      console.error("Veritabanı sorgu hatası:", dbError);
      return NextResponse.json(
        { error: "İşlem geçmişi alınırken bir hata oluştu" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("İşlem geçmişi getirme hatası:", error);
    return NextResponse.json(
      { error: "İşlem geçmişi alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
} 