import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Yetkilendirme hatası" },
        { status: 401 }
      );
    }
    
    // Kullanıcının kapalı pozisyonlarını getir
    const closedPositions = await prisma.position.findMany({
      where: {
        userId: session.user.id,
        status: "CLOSED",
      },
      orderBy: {
        closedAt: "desc",
      },
    });
    
    return NextResponse.json(closedPositions);
  } catch (error) {
    console.error("Kapalı pozisyonlar alınırken hata:", error);
    return NextResponse.json(
      { error: "Kapalı pozisyonlar alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
} 